"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, Bell, Check, MessageSquare, GitCommitHorizontal, DollarSign, ShieldCheck, X, Upload, UserPlus, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNotifications, type Notification } from "@/lib/notifications/use-notifications";
import { relativeTime } from "@/lib/relative-time";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  /** Render variant: rail (desktop sidebar) or mobile (bottom nav) */
  variant: "rail" | "mobile";
};

export function NotificationBell({ userId, variant }: Props) {
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleItemClick = useCallback(
    (n: Notification) => {
      if (!n.read) markRead(n.id);
      // Navigate to the relevant page
      if (n.track_id && n.release_id) {
        router.push(`/app/releases/${n.release_id}/tracks/${n.track_id}`);
      } else if (n.release_id) {
        router.push(`/app/releases/${n.release_id}`);
      }
      setOpen(false);
    },
    [markRead, router],
  );

  if (variant === "mobile") {
    return (
      <>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative flex flex-col items-center gap-1 px-4 py-2 transition-colors text-muted"
        >
          <Bell size={20} strokeWidth={1.5} />
          {unreadCount > 0 && <Badge count={unreadCount} />}
          <span className="text-[10px] font-medium">Alerts</span>
        </button>
        {open && (
          <NotificationPanel
            ref={panelRef}
            notifications={notifications}
            onItemClick={handleItemClick}
            onMarkAllRead={markAllRead}
            onDismiss={dismiss}
            onClearAll={clearAll}
            onClose={() => setOpen(false)}
            position="mobile"
          />
        )}
      </>
    );
  }

  // Rail variant
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex items-center gap-3 w-full px-3 h-10 rounded-md",
          "text-muted transition-all duration-150",
          "hover:text-text hover:bg-panel2",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
        )}
      >
        <span className="w-10 h-10 grid place-items-center shrink-0 relative">
          <Bell size={20} strokeWidth={1.5} />
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </span>
        <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
          Notifications
        </span>
      </button>
      {open && (
        <NotificationPanel
          ref={panelRef}
          notifications={notifications}
          onItemClick={handleItemClick}
          onMarkAllRead={markAllRead}
          onDismiss={dismiss}
          onClearAll={clearAll}
          onClose={() => setOpen(false)}
          position="rail"
        />
      )}
    </>
  );
}

/* ─── Badge ──────────────────────────────────────────────── */

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-signal text-[10px] font-semibold text-white px-1 leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ─── Notification Icon ──────────────────────────────────── */

function NotificationIcon({ type }: { type: string }) {
  const cls = "shrink-0 text-muted";
  switch (type) {
    case "comment":
    case "portal_comment":
      return <MessageSquare size={16} strokeWidth={1.5} className={cls} />;
    case "status_change":
      return <GitCommitHorizontal size={16} strokeWidth={1.5} className={cls} />;
    case "payment_update":
      return <DollarSign size={16} strokeWidth={1.5} className={cls} />;
    case "approval":
      return <ShieldCheck size={16} strokeWidth={1.5} className={cls} />;
    case "audio_upload":
      return <Upload size={16} strokeWidth={1.5} className={cls} />;
    case "collaborator_joined":
      return <UserPlus size={16} strokeWidth={1.5} className={cls} />;
    case "export_complete":
      return <Download size={16} strokeWidth={1.5} className={cls} />;
    case "spec_mismatch":
      return <AlertTriangle size={16} strokeWidth={1.5} className={cls} />;
    default:
      return <Bell size={16} strokeWidth={1.5} className={cls} />;
  }
}

/* ─── Notification Panel (dropdown) ──────────────────────── */

import { forwardRef } from "react";

type PanelProps = {
  notifications: Notification[];
  onItemClick: (n: Notification) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  position: "rail" | "mobile";
};

const NotificationPanel = forwardRef<HTMLDivElement, PanelProps>(
  function NotificationPanel({ notifications, onItemClick, onMarkAllRead, onDismiss, onClearAll, onClose, position }, ref) {
    return (
      <div
        ref={ref}
        style={{ background: "var(--panel)" }}
        className={cn(
          "fixed z-50 border border-border rounded-xl shadow-xl overflow-hidden",
          "flex flex-col",
          position === "rail"
            ? "left-16 bottom-16 w-80 max-h-[min(480px,70dvh)]"
            : "left-2 right-2 bottom-[72px] max-h-[min(480px,60dvh)]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-text">Notifications</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs text-muted hover:text-text transition-colors flex items-center gap-1"
            >
              <Check size={12} strokeWidth={2} />
              Mark all read
            </button>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-muted hover:text-text transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-text transition-colors"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "w-full text-left px-4 py-3 flex gap-3 items-start border-b border-border/50",
                  "hover:bg-panel2 transition-colors group/notif",
                  !n.read && "bg-signal-muted/30",
                )}
              >
                <button
                  type="button"
                  onClick={() => onItemClick(n)}
                  className="mt-0.5 shrink-0"
                >
                  <NotificationIcon type={n.type} />
                </button>
                <button
                  type="button"
                  onClick={() => onItemClick(n)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className={cn("text-sm leading-snug", !n.read ? "text-text font-medium" : "text-muted")}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-[10px] text-muted/60 mt-1">
                    {n.actor_name ? `${n.actor_name} \u00b7 ` : ""}
                    {relativeTime(n.created_at)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(n.id);
                  }}
                  className="shrink-0 mt-0.5 text-muted/0 group-hover/notif:text-muted hover:!text-text transition-colors"
                  title="Dismiss"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  },
);
