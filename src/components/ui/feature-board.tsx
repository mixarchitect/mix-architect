"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type { FeatureCategory } from "@/lib/help/types";

const CATEGORIES: { value: FeatureCategory; label: string }[] = [
  { value: "workflow", label: "Workflow" },
  { value: "audio", label: "Audio" },
  { value: "collaboration", label: "Collaboration" },
  { value: "integrations", label: "Integrations" },
  { value: "distribution", label: "Distribution" },
  { value: "payments", label: "Payments" },
  { value: "mobile", label: "Mobile" },
  { value: "other", label: "Other" },
];

export function FeatureBoard() {
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FeatureCategory>("workflow");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      setLoading(false);
    });
  }, [supabase]);

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("feature_requests").insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        title: title.trim(),
        description: description.trim(),
        category,
        vote_count: 1,
      });

      if (error) throw error;

      setSubmitted(true);
      setTitle("");
      setCategory("workflow");
      setDescription("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit feature request";
      toast(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted text-sm">
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-sm">
          Sign in to suggest features for Mix Architect.
        </p>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-900/30 mb-4">
          <Check size={24} className="text-teal-400" />
        </div>
        <h3 className="text-base font-medium text-text mb-1">
          Thanks for your suggestion!
        </h3>
        <p className="text-sm text-muted mb-6">
          Our team will review it and follow up if we have questions.
        </p>
        <Button
          variant="secondary"
          onClick={() => setSubmitted(false)}
          className="text-xs"
        >
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted mb-6">
        Have an idea for Mix Architect? Submit it below and our team will review
        it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label text-faint block mb-2">Title</label>
          <input
            type="text"
            className="input"
            placeholder="What would you like to see?"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label text-faint block mb-2">Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as FeatureCategory)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-faint block mb-2">Description</label>
          <textarea
            className="input min-h-[100px] resize-y"
            placeholder="Tell us more. Why would this help your workflow?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <p className="text-faint text-xs mt-1">Minimum 20 characters</p>
        </div>

        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Request"
          )}
        </Button>
      </form>
    </div>
  );
}
