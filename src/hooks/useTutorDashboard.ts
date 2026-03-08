import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TutorSession {
  id: string;
  learner_id: string;
  learner_name: string;
  grade: string | null;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  meeting_link: string | null;
}

interface TutorStats {
  totalSessions: number;
  thisMonth: number;
  completedThisMonth: number;
  upcomingCount: number;
}

export const useTutorDashboard = (userId: string | undefined) => {
  const [upcomingSessions, setUpcomingSessions] = useState<TutorSession[]>([]);
  const [recentSessions, setRecentSessions] = useState<TutorSession[]>([]);
  const [stats, setStats] = useState<TutorStats>({
    totalSessions: 0,
    thisMonth: 0,
    completedThisMonth: 0,
    upcomingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    if (!userId) return;
    setLoading(true);

    const now = new Date().toISOString();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [upcomingRes, recentRes, allMonthRes, allTimeRes] = await Promise.all([
      // Upcoming sessions
      supabase
        .from("session_bookings")
        .select("*")
        .eq("tutor_id", userId)
        .in("status", ["pending", "confirmed"])
        .gte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })
        .limit(5),
      // Recent completed sessions
      supabase
        .from("session_bookings")
        .select("*")
        .eq("tutor_id", userId)
        .eq("status", "completed")
        .order("scheduled_at", { ascending: false })
        .limit(5),
      // This month's sessions
      supabase
        .from("session_bookings")
        .select("id, status")
        .eq("tutor_id", userId)
        .gte("scheduled_at", startOfMonth.toISOString()),
      // All-time count
      supabase
        .from("session_bookings")
        .select("id", { count: "exact", head: true })
        .eq("tutor_id", userId),
    ]);

    // Collect all learner IDs from upcoming + recent
    const allBookings = [...(upcomingRes.data || []), ...(recentRes.data || [])];
    const learnerIds = [...new Set(allBookings.map((b) => b.learner_id))];

    let profilesMap: Record<string, { first_name: string; last_name: string; grade: string | null }> = {};
    if (learnerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, grade")
        .in("user_id", learnerIds);

      if (profiles) {
        for (const p of profiles) {
          profilesMap[p.user_id] = p;
        }
      }
    }

    const mapSession = (b: any): TutorSession => {
      const profile = profilesMap[b.learner_id];
      return {
        id: b.id,
        learner_id: b.learner_id,
        learner_name: profile ? `${profile.first_name} ${profile.last_name.charAt(0)}.` : "Unknown Learner",
        grade: profile?.grade || null,
        subject: b.subject,
        scheduled_at: b.scheduled_at,
        duration_minutes: b.duration_minutes,
        status: b.status,
        notes: b.notes,
        meeting_link: b.meeting_link,
      };
    };

    setUpcomingSessions((upcomingRes.data || []).map(mapSession));
    setRecentSessions((recentRes.data || []).map(mapSession));

    const monthData = allMonthRes.data || [];
    setStats({
      totalSessions: allTimeRes.count || 0,
      thisMonth: monthData.length,
      completedThisMonth: monthData.filter((s) => s.status === "completed").length,
      upcomingCount: (upcomingRes.data || []).length,
    });

    setLoading(false);
  };

  return { upcomingSessions, recentSessions, stats, loading, refetch: fetchDashboardData };
};
