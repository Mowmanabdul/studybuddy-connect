import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LearnerProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  grade: string | null;
  avatar_url: string | null;
}

interface LearnerAttempt {
  id: string;
  test_id: string;
  score: number | null;
  total_questions: number | null;
  status: string;
  completed_at: string | null;
  started_at: string;
  diagnostic_tests: {
    title: string;
    subject: string;
    grade: string;
  } | null;
}

interface LearnerDiagnosticData {
  profile: LearnerProfile;
  attempts: LearnerAttempt[];
}

export function useTutorLearners() {
  const { user } = useAuth();
  const [learners, setLearners] = useState<LearnerDiagnosticData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchLearnerData();
  }, [user]);

  const fetchLearnerData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get unique learner IDs from session bookings with this tutor
      const { data: bookings, error: bookingsError } = await supabase
        .from("session_bookings")
        .select("learner_id")
        .eq("tutor_id", user.id);

      if (bookingsError) throw bookingsError;

      const learnerIds = [...new Set((bookings || []).map((b) => b.learner_id))];

      if (learnerIds.length === 0) {
        setLearners([]);
        setLoading(false);
        return;
      }

      // Fetch profiles and diagnostic attempts in parallel
      const [profilesRes, attemptsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, first_name, last_name, grade, avatar_url")
          .in("user_id", learnerIds),
        supabase
          .from("diagnostic_attempts")
          .select(`*, diagnostic_tests (title, subject, grade)`)
          .in("user_id", learnerIds)
          .eq("status", "completed")
          .order("completed_at", { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      // Group by learner — include ALL learners, even those without diagnostics
      const learnerMap: LearnerDiagnosticData[] = (profilesRes.data || []).map((profile) => ({
        profile,
        attempts: (attemptsRes.data || []).filter((a) => a.user_id === profile.user_id) as LearnerAttempt[],
      }));

      setLearners(learnerMap);
    } catch (error) {
      console.error("Error fetching learner diagnostic data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { learners, loading, refetch: fetchLearnerData };
}
