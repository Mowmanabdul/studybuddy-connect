import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Answer {
  question_id: string;
  question_text: string;
  topic: string;
  difficulty: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
}

interface AttemptData {
  attempt_id: string;
  test_title: string;
  subject: string;
  grade: string;
  score: number;
  total_questions: number;
  answers: Answer[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { attemptId } = await req.json();
    
    if (!attemptId) {
      throw new Error("attemptId is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch attempt with test details
    const { data: attempt, error: attemptError } = await supabase
      .from("diagnostic_attempts")
      .select(`
        id,
        score,
        total_questions,
        diagnostic_tests (
          title,
          subject,
          grade
        )
      `)
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      console.error("Error fetching attempt:", attemptError);
      throw new Error("Failed to fetch attempt data");
    }

    // Fetch answers with questions
    const { data: answersData, error: answersError } = await supabase
      .from("diagnostic_answers")
      .select(`
        id,
        selected_option_id,
        is_correct,
        diagnostic_questions (
          id,
          question_text,
          topic,
          difficulty,
          options
        )
      `)
      .eq("attempt_id", attemptId);

    if (answersError) {
      console.error("Error fetching answers:", answersError);
      throw new Error("Failed to fetch answer data");
    }

    // Format data for AI analysis
    const test = attempt.diagnostic_tests as any;
    const formattedAnswers: Answer[] = (answersData || []).map((a: any) => {
      const question = a.diagnostic_questions;
      const options = question.options as any[];
      const correctOption = options.find((o: any) => o.isCorrect);
      const selectedOption = options.find((o: any) => o.id === a.selected_option_id);
      
      return {
        question_id: question.id,
        question_text: question.question_text,
        topic: question.topic,
        difficulty: question.difficulty,
        selected_option: selectedOption?.text || "No answer",
        correct_option: correctOption?.text || "Unknown",
        is_correct: a.is_correct,
      };
    });

    const attemptData: AttemptData = {
      attempt_id: attemptId,
      test_title: test.title,
      subject: test.subject,
      grade: test.grade,
      score: attempt.score || 0,
      total_questions: attempt.total_questions || formattedAnswers.length,
      answers: formattedAnswers,
    };

    // Group answers by topic for analysis
    const topicPerformance: Record<string, { correct: number; total: number }> = {};
    formattedAnswers.forEach((answer) => {
      if (!topicPerformance[answer.topic]) {
        topicPerformance[answer.topic] = { correct: 0, total: 0 };
      }
      topicPerformance[answer.topic].total++;
      if (answer.is_correct) {
        topicPerformance[answer.topic].correct++;
      }
    });

    const systemPrompt = `You are an expert South African educational advisor specializing in ${attemptData.subject} for Grade ${attemptData.grade} learners following the CAPS curriculum. 
    
Your task is to analyze a student's diagnostic test results and provide personalized, actionable recommendations to help them improve.

Always be encouraging but honest. Focus on specific areas where the student needs help and provide concrete study strategies.`;

    const userPrompt = `Analyze this diagnostic test result and provide personalized recommendations:

**Test:** ${attemptData.test_title}
**Subject:** ${attemptData.subject}
**Grade:** ${attemptData.grade}
**Score:** ${attemptData.score}/${attemptData.total_questions} (${Math.round((attemptData.score / attemptData.total_questions) * 100)}%)

**Topic Performance:**
${Object.entries(topicPerformance)
  .map(([topic, perf]) => `- ${topic}: ${perf.correct}/${perf.total} correct (${Math.round((perf.correct / perf.total) * 100)}%)`)
  .join("\n")}

**Detailed Answers:**
${formattedAnswers.map((a, i) => `
Q${i + 1} (${a.topic} - ${a.difficulty}): ${a.is_correct ? "✓ Correct" : "✗ Incorrect"}
Question: ${a.question_text}
Student answered: ${a.selected_option}
${!a.is_correct ? `Correct answer: ${a.correct_option}` : ""}
`).join("\n")}

Provide your analysis using the suggest_recommendations tool.`;

    // Call Lovable AI with tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_recommendations",
              description: "Provide structured learning recommendations based on diagnostic test results",
              parameters: {
                type: "object",
                properties: {
                  overall_analysis: {
                    type: "string",
                    description: "A 2-3 paragraph encouraging analysis of the student's overall performance, acknowledging strengths and areas for growth",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of topics or skills where the student showed good understanding (max 4)",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of topics or skills that need improvement (max 4)",
                  },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        topic: { type: "string", description: "The topic this recommendation addresses" },
                        suggestion: { type: "string", description: "Specific, actionable study suggestion (1-2 sentences)" },
                        priority: { type: "string", enum: ["high", "medium", "low"], description: "Priority level based on impact" },
                      },
                      required: ["topic", "suggestion", "priority"],
                    },
                    description: "3-5 specific study recommendations",
                  },
                  study_plan: {
                    type: "string",
                    description: "A brief 1-week study plan outline with daily focus areas",
                  },
                },
                required: ["overall_analysis", "strengths", "weaknesses", "recommendations", "study_plan"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_recommendations" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate AI recommendations");
    }

    const aiResult = await response.json();
    console.log("AI response:", JSON.stringify(aiResult, null, 2));

    // Extract tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "suggest_recommendations") {
      throw new Error("Invalid AI response format");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    // Save recommendations to database
    const { data: savedRec, error: saveError } = await supabase
      .from("diagnostic_recommendations")
      .insert({
        attempt_id: attemptId,
        overall_analysis: recommendations.overall_analysis,
        strengths: recommendations.strengths,
        weaknesses: recommendations.weaknesses,
        recommendations: recommendations.recommendations,
        study_plan: recommendations.study_plan,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving recommendations:", saveError);
      throw new Error("Failed to save recommendations");
    }

    console.log("Recommendations saved successfully:", savedRec.id);

    return new Response(
      JSON.stringify({ success: true, recommendations: savedRec }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
