import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      const typed = (data || []) as unknown as Notification[];
      setNotifications(typed);
      setUnreadCount(typed.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const clearNotification = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);
    if (!error) {
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.is_read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });
    }
  };

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as unknown as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    fetchNotifications,
  };
}

// Helper to create a notification (called from booking flow)
export async function createBookingNotification(
  tutorId: string,
  learnerName: string,
  subject: string,
  scheduledAt: string
) {
  const formattedDate = new Date(scheduledAt).toLocaleDateString("en-ZA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { error } = await supabase.from("notifications").insert({
    user_id: tutorId,
    type: "booking",
    title: "New Session Booking",
    message: `${learnerName} booked a ${subject} session for ${formattedDate}`,
    metadata: { subject, scheduled_at: scheduledAt },
  });

  if (error) console.error("Failed to create notification:", error);
}
