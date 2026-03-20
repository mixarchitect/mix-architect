"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { PromptTrigger } from "@/hooks/usePostActionPrompt";

type PostActionPromptProps = {
  trigger: PromptTrigger;
  engineerId: string;
  onDismiss: () => void;
};

const CONTENT: Record<PromptTrigger, { headline: string; body: string }> = {
  approval: {
    headline: "Love working with a pro?",
    body: "Manage your own releases with the same tools your engineer uses.",
  },
  download: {
    headline: "Managing your own releases?",
    body: "Mix Architect helps you organize everything from demo to distribution.",
  },
  comment: {
    headline: "Collaborate on your own projects",
    body: "Track revisions, manage timelines, and stay organized.",
  },
};

/**
 * Non-modal, dismissible slide-in prompt that appears after a client
 * completes a meaningful action on the portal (approve, download, comment).
 */
export function PostActionPrompt({
  trigger,
  engineerId,
  onDismiss,
}: PostActionPromptProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const { headline, body } = CONTENT[trigger];

  // Animate in on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleDismiss() {
    setExiting(true);
    setTimeout(() => onDismiss(), 300);
  }

  function handleCTA() {
    // Fire-and-forget attribution tracking
    fetch("/api/attributions/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engineer_id: engineerId,
        source: "post_action_prompt",
        page_type: "delivery_portal",
      }),
    }).catch(() => {});

    // Open signup page in new tab
    window.open("https://mixarchitect.com", "_blank", "noopener,noreferrer");

    // Dismiss after click
    handleDismiss();
  }

  return (
    <div
      role="complementary"
      aria-label={headline}
      className={`
        fixed z-50 transition-transform duration-300 ease-out
        ${visible && !exiting ? "translate-y-0" : "translate-y-full"}
        bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto
        md:max-w-[400px]
      `}
    >
      <div className="bg-panel border border-border rounded-t-lg md:rounded-lg shadow-lg overflow-hidden">
        {/* Dismiss button */}
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={handleDismiss}
            className="text-faint hover:text-muted transition-colors p-1 -m-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0" aria-hidden="true">
              🎵
            </span>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-text">{headline}</h3>
              <p className="text-xs text-muted leading-relaxed">{body}</p>
            </div>
          </div>

          <button
            onClick={handleCTA}
            className="w-full h-9 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors"
          >
            Try it free, no credit card required
          </button>
        </div>
      </div>
    </div>
  );
}
