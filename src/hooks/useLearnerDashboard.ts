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

interface CompletedSession {
  id: string;
  subject: string;
  tutor_name: string;
  scheduled_at: string;
  tutor_notes: string | null;
  duration_minutes: number;
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
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      
      const [sessionsRes, diagnosticsRes, quizzesRes, diagnosticDatesRes] = await Promise.all([
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
        // Get quiz completion dates for streak
        supabase
          .from("quiz_sessions")
          .select("completed_at")
          .eq("user_id", userId)
          .eq("status", "completed")
          .not("completed_at", "is", null),
        // Get diagnostic completion dates for streak
        supabase
          .from("diagnostic_attempts")
          .select("completed_at")
          .eq("user_id", userId)
          .eq("status", "completed")
          .not("completed_at", "is", null),
      ]);

      if (sessionsRes.data) {
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

      // Calculate streak from activity dates
      const activityDates = new Set<string>();
      for (const q of quizzesRes.data || []) {
        if (q.completed_at) activityDates.add(new Date(q.completed_at).toDateString());
      }
      for (const d of diagnosticDatesRes.data || []) {
        if (d.completed_at) activityDates.add(new Date(d.completed_at).toDateString());
      }
      
      let currentStreak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        if (activityDates.has(checkDate.toDateString())) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }
      setStreak(currentStreak);

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  return { upcomingSessions, recentDiagnostics, streak, loading };
}
