"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type PromptTrigger = "approval" | "download" | "comment";

const SESSION_KEY = "mix_promo_dismissed";
const DELAY_MS = 1500;

/**
 * Manages state for showing/hiding the post-action signup prompt.
 * - Only shows once per session (sessionStorage flag)
 * - Adds a 1.5s delay before showing
 * - Exposes triggerPrompt, showPrompt, promptTrigger, dismissPrompt
 */
export function usePostActionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptTrigger, setPromptTrigger] = useState<PromptTrigger | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const triggerPrompt = useCallback((trigger: PromptTrigger) => {
    // Check if already dismissed this session
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    } catch {
      // sessionStorage not available (SSR, private browsing edge case)
    }

    // Don't re-trigger if already showing
    if (showPrompt) return;

    // Delay before showing
    timerRef.current = setTimeout(() => {
      setPromptTrigger(trigger);
      setShowPrompt(true);
    }, DELAY_MS);
  }, [showPrompt]);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    setPromptTrigger(null);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Silent failure
    }
  }, []);

  return { showPrompt, promptTrigger, triggerPrompt, dismissPrompt };
}
