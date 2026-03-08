import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  tutor_notes: string | null;
}

interface TutorStats {
  totalSessions: number;
  thisMonth: number;
  completedThisMonth: number;
  upcomingCount: number;
  totalHours: number;
  uniqueLearners: number;
}

export const useTutorDashboard = (userId: string | undefined) => {
  const [upcomingSessions, setUpcomingSessions] = useState<TutorSession[]>([]);
  const [recentSessions, setRecentSessions] = useState<TutorSession[]>([]);
  const [stats, setStats] = useState<TutorStats>({
    totalSessions: 0,
    thisMonth: 0,
    completedThisMonth: 0,
    upcomingCount: 0,
    totalHours: 0,
    uniqueLearners: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const now = new Date().toISOString();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [upcomingRes, recentRes, allMonthRes, allTimeRes, hoursRes] = await Promise.all([
      supabase
        .from("session_bookings")
        .select("*")
        .eq("tutor_id", userId)
        .in("status", ["pending", "confirmed"])
        .gte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })
        .limit(10),
      supabase
        .from("session_bookings")
        .select("*")
        .eq("tutor_id", userId)
        .eq("status", "completed")
        .order("scheduled_at", { ascending: false })
        .limit(5),
      supabase
        .from("session_bookings")
        .select("id, status")
        .eq("tutor_id", userId)
        .gte("scheduled_at", startOfMonth.toISOString()),
      supabase
        .from("session_bookings")
        .select("id, learner_id", { count: "exact" })
        .eq("tutor_id", userId),
      // Get total hours from completed sessions
      supabase
        .from("session_bookings")
        .select("duration_minutes")
        .eq("tutor_id", userId)
        .eq("status", "completed"),
    ]);

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
        tutor_notes: b.tutor_notes,
      };
    };

    setUpcomingSessions((upcomingRes.data || []).map(mapSession));
    setRecentSessions((recentRes.data || []).map(mapSession));

    const monthData = allMonthRes.data || [];
    const totalMinutes = (hoursRes.data || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const allLearnerIds = new Set((allTimeRes.data || []).map((b) => b.learner_id));
    
    setStats({
      totalSessions: allTimeRes.count || 0,
      thisMonth: monthData.length,
      completedThisMonth: monthData.filter((s) => s.status === "completed").length,
      upcomingCount: (upcomingRes.data || []).length,
      totalHours: Math.round(totalMinutes / 60),
      uniqueLearners: allLearnerIds.size,
    });

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchDashboardData();
  }, [userId, fetchDashboardData]);

  const confirmSession = async (sessionId: string) => {
    const { error } = await supabase
      .from("session_bookings")
      .update({ status: "confirmed" })
      .eq("id", sessionId);
    if (error) {
      toast.error("Failed to confirm session");
    } else {
      toast.success("Session confirmed!");
      fetchDashboardData();
    }
  };

  const declineSession = async (sessionId: string) => {
    const { error } = await supabase
      .from("session_bookings")
      .update({ status: "cancelled" })
      .eq("id", sessionId);
    if (error) {
      toast.error("Failed to decline session");
    } else {
      toast.success("Session declined");
      fetchDashboardData();
    }
  };

  const addMeetingLink = async (sessionId: string, link: string) => {
    const { error } = await supabase
      .from("session_bookings")
      .update({ meeting_link: link })
      .eq("id", sessionId);
    if (error) {
      toast.error("Failed to save meeting link");
    } else {
      toast.success("Meeting link saved!");
      fetchDashboardData();
    }
  };

  const completeSession = async (sessionId: string) => {
    const { error } = await supabase
      .from("session_bookings")
      .update({ status: "completed" })
      .eq("id", sessionId);
    if (error) {
      toast.error("Failed to mark session complete");
    } else {
      toast.success("Session marked as complete");
      fetchDashboardData();
    }
  };

  const saveTutorNotes = async (sessionId: string, notes: string) => {
    const { error } = await supabase
      .from("session_bookings")
      .update({ tutor_notes: notes } as any)
      .eq("id", sessionId);
    if (error) {
      toast.error("Failed to save session notes");
    } else {
      toast.success("Session notes saved!");
      fetchDashboardData();
    }
  };

  return {
    upcomingSessions,
    recentSessions,
    stats,
    loading,
    refetch: fetchDashboardData,
    confirmSession,
    declineSession,
    addMeetingLink,
    completeSession,
  };
};
