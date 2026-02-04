import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject: string;
  is_active: boolean;
}

export interface SessionBooking {
  id: string;
  tutor_id: string;
  learner_id: string;
  subject: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  meeting_link: string | null;
  tutor_profile?: {
    first_name: string;
    last_name: string;
  };
  learner_profile?: {
    first_name: string;
    last_name: string;
  };
}

export interface TutorWithAvailability {
  tutor_id: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  subjects: string[] | null;
  availability: TutorAvailability[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function useSessionBooking() {
  const { user, role } = useAuth();
  const [availability, setAvailability] = useState<TutorAvailability[]>([]);
  const [sessions, setSessions] = useState<SessionBooking[]>([]);
  const [tutors, setTutors] = useState<TutorWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tutor's own availability
  const fetchMyAvailability = async () => {
    if (!user || role !== "tutor") return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tutor_availability")
        .select("*")
        .eq("tutor_id", user.id)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error: any) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all tutors with their availability (for learners)
  const fetchTutors = async () => {
    setIsLoading(true);
    try {
      // Get all tutor profiles
      const { data: tutorRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "tutor");

      if (rolesError) throw rolesError;

      const tutorIds = tutorRoles?.map(r => r.user_id) || [];
      
      if (tutorIds.length === 0) {
        setTutors([]);
        return;
      }

      // Get profiles for these tutors
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, bio, subjects")
        .in("user_id", tutorIds);

      if (profilesError) throw profilesError;

      // Get availability for these tutors
      const { data: availabilityData, error: availError } = await supabase
        .from("tutor_availability")
        .select("*")
        .in("tutor_id", tutorIds)
        .eq("is_active", true);

      if (availError) throw availError;

      // Combine data
      const tutorsWithAvail: TutorWithAvailability[] = (profiles || []).map(profile => ({
        tutor_id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio,
        subjects: profile.subjects,
        availability: (availabilityData || []).filter(a => a.tutor_id === profile.user_id),
      }));

      setTutors(tutorsWithAvail.filter(t => t.availability.length > 0));
    } catch (error: any) {
      console.error("Error fetching tutors:", error);
      toast.error("Failed to load tutors");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's sessions
  const fetchMySessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("*")
        .or(`tutor_id.eq.${user.id},learner_id.eq.${user.id}`)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;

      // Fetch profile info for the other party
      const sessionsWithProfiles: SessionBooking[] = [];
      
      for (const session of data || []) {
        const otherId = session.tutor_id === user.id ? session.learner_id : session.tutor_id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", otherId)
          .single();

        sessionsWithProfiles.push({
          ...session,
          status: session.status as SessionBooking["status"],
          ...(session.tutor_id === user.id 
            ? { learner_profile: profile || undefined }
            : { tutor_profile: profile || undefined }
          ),
        });
      }

      setSessions(sessionsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  // Add availability slot (for tutors)
  const addAvailability = async (slot: Omit<TutorAvailability, "id" | "tutor_id" | "is_active">) => {
    if (!user || role !== "tutor") return false;

    try {
      const { error } = await supabase.from("tutor_availability").insert({
        tutor_id: user.id,
        ...slot,
      });

      if (error) throw error;
      toast.success("Availability slot added");
      await fetchMyAvailability();
      return true;
    } catch (error: any) {
      console.error("Error adding availability:", error);
      toast.error("Failed to add availability slot");
      return false;
    }
  };

  // Remove availability slot
  const removeAvailability = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from("tutor_availability")
        .delete()
        .eq("id", slotId);

      if (error) throw error;
      toast.success("Availability slot removed");
      await fetchMyAvailability();
      return true;
    } catch (error: any) {
      console.error("Error removing availability:", error);
      toast.error("Failed to remove availability slot");
      return false;
    }
  };

  // Book a session (for learners)
  const bookSession = async (
    tutorId: string,
    subject: string,
    scheduledAt: Date,
    durationMinutes: number,
    notes?: string
  ) => {
    if (!user || role !== "learner") return false;

    try {
      const { error } = await supabase.from("session_bookings").insert({
        tutor_id: tutorId,
        learner_id: user.id,
        subject,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: durationMinutes,
        notes,
      });

      if (error) throw error;
      toast.success("Session booked successfully! Waiting for tutor confirmation.");
      await fetchMySessions();
      return true;
    } catch (error: any) {
      console.error("Error booking session:", error);
      toast.error("Failed to book session");
      return false;
    }
  };

  // Update session status (for tutors)
  const updateSessionStatus = async (
    sessionId: string,
    status: SessionBooking["status"],
    meetingLink?: string
  ) => {
    try {
      const { error } = await supabase
        .from("session_bookings")
        .update({ 
          status,
          ...(meetingLink && { meeting_link: meetingLink }),
        })
        .eq("id", sessionId);

      if (error) throw error;
      toast.success(`Session ${status}`);
      await fetchMySessions();
      return true;
    } catch (error: any) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session");
      return false;
    }
  };

  // Cancel a session (for learners)
  const cancelSession = async (sessionId: string) => {
    return updateSessionStatus(sessionId, "cancelled");
  };

  return {
    availability,
    sessions,
    tutors,
    isLoading,
    fetchMyAvailability,
    fetchTutors,
    fetchMySessions,
    addAvailability,
    removeAvailability,
    bookSession,
    updateSessionStatus,
    cancelSession,
    DAY_NAMES,
  };
}
