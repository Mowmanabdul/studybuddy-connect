import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UpcomingSession {
  id: string;
  subject: string;
  tutor_name: string;
  scheduled_at: string;
  notes: string | null;
  status: string;
}

interface RecentDiagnostic {
  id: string;
  subject: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

export function useLearnerDashboard(userId: string | undefined) {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [recentDiagnostics, setRecentDiagnostics] = useState<RecentDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      
      const [sessionsRes, diagnosticsRes] = await Promise.all([
        supabase
          .from("session_bookings")
          .select("id, subject, scheduled_at, notes, status, tutor_id")
          .eq("learner_id", userId)
          .in("status", ["pending", "confirmed"])
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(3),
        supabase
          .from("diagnostic_attempts")
          .select(`
            id, score, total_questions, completed_at,
            diagnostic_tests (subject)
          `)
          .eq("user_id", userId)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(3),
      ]);

      if (sessionsRes.data) {
        // Fetch tutor names
        const tutorIds = [...new Set(sessionsRes.data.map(s => s.tutor_id))];
        const { data: tutorProfiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", tutorIds);

        const tutorMap = new Map(
          (tutorProfiles || []).map(p => [p.user_id, `${p.first_name} ${p.last_name}`])
        );

        setUpcomingSessions(
          sessionsRes.data.map(s => ({
            id: s.id,
            subject: s.subject,
            tutor_name: tutorMap.get(s.tutor_id) || "Tutor",
            scheduled_at: s.scheduled_at,
            notes: s.notes,
            status: s.status,
          }))
        );
      }

      if (diagnosticsRes.data) {
        setRecentDiagnostics(
          diagnosticsRes.data.map((d: any) => ({
            id: d.id,
            subject: d.diagnostic_tests?.subject || "Unknown",
            score: d.score ?? 0,
            total_questions: d.total_questions ?? 0,
            completed_at: d.completed_at,
          }))
        );
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  return { upcomingSessions, recentDiagnostics, loading };
}
