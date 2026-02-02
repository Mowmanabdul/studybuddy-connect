import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DiagnosticTest {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  grade: string;
  duration_minutes: number;
  total_questions: number;
}

export interface DiagnosticQuestion {
  id: string;
  question_text: string;
  topic: string;
  difficulty: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string | null;
  order_index: number;
}

export interface DiagnosticAttempt {
  id: string;
  test_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_questions: number | null;
  status: string;
}

export interface DiagnosticRecommendation {
  id: string;
  overall_analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{ topic: string; suggestion: string; priority: string }>;
  study_plan: string | null;
}

export function useDiagnostics() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTests = async (grade?: string): Promise<DiagnosticTest[]> => {
    setLoading(true);
    try {
      let query = supabase.from("diagnostic_tests").select("*");
      
      if (grade) {
        query = query.eq("grade", grade);
      }
      
      const { data, error } = await query.order("subject");
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast({
        title: "Error",
        description: "Failed to load diagnostic tests",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (testId: string): Promise<DiagnosticQuestion[]> => {
    try {
      const { data, error } = await supabase
        .from("diagnostic_questions")
        .select("*")
        .eq("test_id", testId)
        .order("order_index");
      
      if (error) throw error;
      
      return (data || []).map((q) => ({
        ...q,
        options: q.options as DiagnosticQuestion["options"],
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
      return [];
    }
  };

  const startAttempt = async (testId: string, userId: string): Promise<DiagnosticAttempt | null> => {
    try {
      const { data: questions } = await supabase
        .from("diagnostic_questions")
        .select("id")
        .eq("test_id", testId);
      
      const totalQuestions = questions?.length || 0;
      
      const { data, error } = await supabase
        .from("diagnostic_attempts")
        .insert({
          test_id: testId,
          user_id: userId,
          total_questions: totalQuestions,
          status: "in_progress",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error starting attempt:", error);
      toast({
        title: "Error",
        description: "Failed to start diagnostic test",
        variant: "destructive",
      });
      return null;
    }
  };

  const submitAnswer = async (
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
    isCorrect: boolean,
    timeSpent: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from("diagnostic_answers").insert({
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent,
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error submitting answer:", error);
      return false;
    }
  };

  const completeAttempt = async (
    attemptId: string,
    score: number,
    timeSpent: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("diagnostic_attempts")
        .update({
          status: "completed",
          score,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
        })
        .eq("id", attemptId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error completing attempt:", error);
      toast({
        title: "Error",
        description: "Failed to complete diagnostic test",
        variant: "destructive",
      });
      return false;
    }
  };

  const generateRecommendations = async (attemptId: string): Promise<DiagnosticRecommendation | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-recommendations", {
        body: { attemptId },
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.recommendations;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recommendations",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchUserAttempts = async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from("diagnostic_attempts")
        .select(`
          *,
          diagnostic_tests (title, subject, grade)
        `)
        .eq("user_id", userId)
        .order("started_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching attempts:", error);
      return [];
    }
  };

  const fetchRecommendation = async (attemptId: string): Promise<DiagnosticRecommendation | null> => {
    try {
      const { data, error } = await supabase
        .from("diagnostic_recommendations")
        .select("*")
        .eq("attempt_id", attemptId)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      
      return {
        ...data,
        strengths: data.strengths as string[],
        weaknesses: data.weaknesses as string[],
        recommendations: data.recommendations as DiagnosticRecommendation["recommendations"],
      };
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      return null;
    }
  };

  return {
    loading,
    fetchTests,
    fetchQuestions,
    startAttempt,
    submitAnswer,
    completeAttempt,
    generateRecommendations,
    fetchUserAttempts,
    fetchRecommendation,
  };
}
