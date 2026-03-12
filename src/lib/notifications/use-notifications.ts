"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  release_id: string | null;
  track_id: string | null;
  actor_name: string | null;
  read: boolean;
  created_at: string;
};

const PAGE_SIZE = 30;

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createSupabaseBrowserClient>["channel"]
  > | null>(null);

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();

    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      const rows = (data ?? []) as Notification[];
      setNotifications(rows);
      setUnreadCount(rows.filter((n) => !n.read).length);
      setLoading(false);
    }

    load();
  }, [userId]);

  // Subscribe to realtime inserts
  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newRow = payload.new as unknown as Notification;
          setNotifications((prev) => [newRow, ...prev].slice(0, PAGE_SIZE));
          setUnreadCount((prev) => prev + 1);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId]);

  // Mark a single notification as read
  const markRead = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const supabase = createSupabaseBrowserClient();
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
    },
    [],
  );

  // Mark all as read
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
  }, [userId]);

  // Dismiss a single notification
  const dismiss = useCallback(
    async (notificationId: string) => {
      const target = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (target && !target.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      const supabase = createSupabaseBrowserClient();
      await supabase.from("notifications").delete().eq("id", notificationId);
    },
    [notifications],
  );

  // Clear all notifications
  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);

    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("notifications").delete().eq("user_id", userId);
  }, [userId]);

  return { notifications, unreadCount, loading, markRead, markAllRead, dismiss, clearAll };
}
