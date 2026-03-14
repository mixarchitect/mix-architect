"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { Send, Mail, CheckCircle, AlertTriangle } from "lucide-react";

interface NotificationLog {
  id: string;
  recipient_email: string;
  subject: string;
  heading: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  category: string;
  created_at: string;
}

interface UserOption {
  userId: string;
  email: string;
  plan: string;
  status: string;
}

const categoryPresets: Record<string, { heading: string; body: string; ctaLabel: string; ctaUrl: string }> = {
  churn_outreach: {
    heading: "We miss you!",
    body: "We noticed you recently cancelled your Mix Architect subscription. We'd love to hear what we could do better.\n\nIf there's anything we can help with, just reply to this email.",
    ctaLabel: "Resubscribe",
    ctaUrl: "https://app.mixarchitect.com/app/settings",
  },
  welcome: {
    heading: "Welcome to Mix Architect",
    body: "Thanks for signing up! We're excited to have you on board.\n\nIf you have any questions or need help getting started, don't hesitate to reach out.",
    ctaLabel: "Get Started",
    ctaUrl: "https://app.mixarchitect.com/app",
  },
  custom: {
    heading: "",
    body: "",
    ctaLabel: "",
    ctaUrl: "",
  },
};

export function NotificationsPanel({
  sentLog,
  userOptions,
}: {
  sentLog: NotificationLog[];
  userOptions: UserOption[];
}) {
  const [category, setCategory] = useState("custom");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientUserId, setRecipientUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCategoryChange(cat: string) {
    setCategory(cat);
    const preset = categoryPresets[cat];
    if (preset) {
      setHeading(preset.heading);
      setBody(preset.body);
      setCtaLabel(preset.ctaLabel);
      setCtaUrl(preset.ctaUrl);
      if (cat !== "custom") {
        setSubject(preset.heading);
      }
    }
  }

  function handleUserSelect(email: string) {
    setRecipientEmail(email);
    const user = userOptions.find((u) => u.email === email);
    setRecipientUserId(user?.userId ?? "");
  }

  function handleSend() {
    if (!recipientEmail || !subject || !heading || !body) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail,
            recipientUserId: recipientUserId || undefined,
            subject,
            heading,
            body,
            ctaLabel: ctaLabel || undefined,
            ctaUrl: ctaUrl || undefined,
            category,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to send");
        }

        setStatus("success");
        setRecipientEmail("");
        setRecipientUserId("");
        setSubject("");
        setHeading("");
        setBody("");
        setCtaLabel("");
        setCtaUrl("");
        setCategory("custom");

        // Reset success after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to send");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Compose form */}
      <div className="rounded-lg border border-border bg-panel p-5">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Send size={18} className="text-amber-500" />
          Compose Notification
        </h2>

        <div className="space-y-4">
          {/* Category preset */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
              Template
            </label>
            <div className="flex gap-1">
              {["custom", "churn_outreach", "welcome"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors capitalize",
                    category === cat
                      ? "bg-amber-600/15 text-amber-500 font-medium"
                      : "text-muted hover:text-text hover:bg-panel2",
                  )}
                >
                  {cat.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
              Recipient Email *
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => handleUserSelect(e.target.value)}
              list="user-emails"
              placeholder="user@example.com"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
            />
            <datalist id="user-emails">
              {userOptions.map((u) => (
                <option key={u.userId} value={u.email}>
                  {u.email} ({u.plan}/{u.status})
                </option>
              ))}
            </datalist>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Heading */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
              Heading *
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Email heading"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
              Body *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Email body text (newlines are preserved)"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50 resize-y"
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
                Button Label
              </label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="e.g. Get Started"
                className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
                Button URL
              </label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Send button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSend}
              disabled={isPending}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isPending
                  ? "bg-amber-600/30 text-amber-500/50 cursor-not-allowed"
                  : "bg-amber-600 text-white hover:bg-amber-500",
              )}
            >
              <Send size={14} />
              {isPending ? "Sending..." : "Send Notification"}
            </button>

            {status === "success" && (
              <span className="flex items-center gap-1 text-sm text-emerald-500">
                <CheckCircle size={14} /> Sent successfully
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 text-sm text-red-400">
                <AlertTriangle size={14} /> {errorMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sent log */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <Mail size={18} className="text-muted" />
          Sent Notifications
        </h2>

        {sentLog.length === 0 ? (
          <div className="rounded-lg border border-border bg-panel p-8 text-center">
            <Mail size={24} className="mx-auto mb-2 text-muted" />
            <p className="text-sm text-muted">No notifications sent yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-panel divide-y divide-border">
            {sentLog.map((log) => (
              <div key={log.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text">{log.recipient_email}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded border border-border text-faint capitalize">
                    {log.category.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-sm text-muted mb-0.5">{log.subject}</div>
                <div className="text-xs text-faint">
                  {new Date(log.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
