"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { CheckCircle2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody } from "@/components/ui/panel";
import type { BugSeverity } from "@/lib/help/types";

const SEVERITY_OPTIONS: { value: BugSeverity; label: string; hint: string }[] =
  [
    { value: "low", label: "Low", hint: "Minor visual glitch, non-blocking" },
    {
      value: "medium",
      label: "Medium",
      hint: "Feature not working as expected",
    },
    {
      value: "high",
      label: "High",
      hint: "Significant workflow blocked",
    },
    {
      value: "critical",
      label: "Critical",
      hint: "Data loss or cannot use the app",
    },
  ];

export function BugReportForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("medium");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (description.trim().length < 20) {
      toast("Description must be at least 20 characters.", {
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("bug_reports").insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        title: title.trim(),
        description: description.trim(),
        steps: steps.trim() || null,
        severity,
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit bug report";
      toast(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTitle("");
    setSeverity("medium");
    setDescription("");
    setSteps("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <Panel className="max-w-xl">
        <PanelBody className="pt-6 text-center">
          <CheckCircle2
            size={32}
            strokeWidth={1.5}
            className="text-status-green mx-auto mb-3"
          />
          <h3 className="text-sm font-semibold mb-1">
            Bug report submitted
          </h3>
          <p className="text-muted text-sm mb-5">
            Thank you. We review every report and will follow up if we need more
            info.
          </p>
          <Button variant="ghost" onClick={resetForm}>
            Submit Another
          </Button>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {/* Title */}
      <div>
        <label className="label text-faint block mb-2">Title</label>
        <input
          type="text"
          className="input"
          placeholder="Brief description of the issue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Severity */}
      <div>
        <label className="label text-faint block mb-2">Severity</label>
        <select
          className="input"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as BugSeverity)}
        >
          {SEVERITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-faint text-xs mt-1.5">
          {SEVERITY_OPTIONS.find((o) => o.value === severity)?.hint}
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="label text-faint block mb-2">Description</label>
        <textarea
          className="input min-h-[120px] resize-y"
          placeholder="What happened? What did you expect?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <p className="text-faint text-xs mt-1">Minimum 20 characters</p>
      </div>

      {/* Steps */}
      <div>
        <label className="label text-faint block mb-2">
          Steps to Reproduce
          <span className="text-faint font-normal ml-1">(optional)</span>
        </label>
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="Step-by-step to trigger the bug"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />
      </div>

      {/* Page URL (auto) */}
      <p className="text-faint text-xs">
        Current page and browser info will be included automatically.
      </p>

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Bug Report"
        )}
      </Button>
    </form>
  );
}
