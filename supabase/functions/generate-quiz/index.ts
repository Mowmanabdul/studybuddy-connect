import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, grade, userId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch learner's recent quiz performance to adapt difficulty
    let performanceContext = "";
    let suggestedDifficulty = "medium";

    if (userId) {
      const { data: recentSessions } = await supabase
        .from("quiz_sessions")
        .select("subject, score, total_questions, difficulty, questions")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentSessions && recentSessions.length > 0) {
        const avgScore =
          recentSessions.reduce(
            (sum: number, s: any) =>
              sum + (s.score / (s.total_questions || 1)) * 100,
            0
          ) / recentSessions.length;

        if (avgScore >= 80) suggestedDifficulty = "hard";
        else if (avgScore >= 50) suggestedDifficulty = "medium";
        else suggestedDifficulty = "easy";

        // Also check diagnostic performance
        const { data: diagAttempts } = await supabase
          .from("diagnostic_attempts")
          .select("score, total_questions, diagnostic_tests!inner(subject)")
          .eq("user_id", userId)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(5);

        const weakTopics: string[] = [];
        if (diagAttempts) {
          for (const a of diagAttempts as any[]) {
            const pct = ((a.score || 0) / (a.total_questions || 1)) * 100;
            if (pct < 60) {
              weakTopics.push(a.diagnostic_tests?.subject || "");
            }
          }
        }

        performanceContext = `
The learner's recent average quiz score is ${Math.round(avgScore)}%.
Suggested difficulty level: ${suggestedDifficulty}.
${weakTopics.length > 0 ? `They struggle with: ${weakTopics.join(", ")}. Include questions targeting these weak areas.` : ""}
Recent quiz count: ${recentSessions.length}. Avoid repeating similar questions from recent quizzes.`;
      }
    }

    const systemPrompt = `You are a South African CAPS curriculum quiz generator for Grade ${grade} ${subject}.

Generate exactly 10 multiple-choice questions. Each question must have exactly 4 options (A, B, C, D) with one correct answer.

${performanceContext}

Rules:
- Questions MUST align with the South African CAPS curriculum for Grade ${grade} ${subject}
- Difficulty: ${suggestedDifficulty} (mix slightly easier and harder questions around this level)
- Cover diverse topics within the subject
- Include clear, unambiguous questions
- Each option should be plausible
- Provide a brief explanation for the correct answer

You MUST call the generate_quiz function with the questions.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate a ${suggestedDifficulty} difficulty quiz for Grade ${grade} ${subject}. Make it engaging and educational.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_quiz",
                description: "Generate a quiz with 10 multiple-choice questions",
                parameters: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string", description: "The question text" },
                          options: {
                            type: "object",
                            properties: {
                              A: { type: "string" },
                              B: { type: "string" },
                              C: { type: "string" },
                              D: { type: "string" },
                            },
                            required: ["A", "B", "C", "D"],
                            additionalProperties: false,
                          },
                          correct: {
                            type: "string",
                            enum: ["A", "B", "C", "D"],
                            description: "The correct option letter",
                          },
                          explanation: { type: "string", description: "Brief explanation of the correct answer" },
                          topic: { type: "string", description: "The topic this question covers" },
                        },
                        required: ["question", "options", "correct", "explanation", "topic"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["questions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_quiz" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate quiz");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No quiz data returned from AI");
    }

    const quizData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        questions: quizData.questions,
        difficulty: suggestedDifficulty,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-quiz error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
