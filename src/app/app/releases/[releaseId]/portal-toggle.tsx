"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Globe, Share2, Check } from "lucide-react";

type ShareData = {
  id: string;
  share_token: string;
  active: boolean;
  show_direction: boolean;
  show_specs: boolean;
  show_references: boolean;
  show_payment_status: boolean;
  show_distribution: boolean;
  require_payment_for_download: boolean;
};

type PortalToggleProps = {
  releaseId: string;
  initialShare: ShareData | null;
};

export function PortalToggle({ releaseId, initialShare }: PortalToggleProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [share, setShare] = useState(initialShare);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const active = share?.active ?? false;

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);

    try {
      if (active && share) {
        await supabase
          .from("brief_shares")
          .update({ active: false })
          .eq("id", share.id);
        setShare((prev) => (prev ? { ...prev, active: false } : prev));
        setOpen(false);
      } else if (share) {
        await supabase
          .from("brief_shares")
          .update({ active: true })
          .eq("id", share.id);
        setShare((prev) => (prev ? { ...prev, active: true } : prev));
      } else {
        const { data } = await supabase
          .from("brief_shares")
          .insert({ release_id: releaseId, active: true })
          .select("*")
          .single();
        if (data) setShare(data);
      }
      router.refresh();
    } finally {
      setToggling(false);
    }
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    if (!share?.share_token) return;
    const url = `${window.location.origin}/portal/${share.share_token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function updateField(field: string, value: unknown) {
    if (!share) return;
    setShare((prev) => (prev ? { ...prev, [field]: value } : prev));
    await supabase
      .from("brief_shares")
      .update({ [field]: value })
      .eq("id", share.id);
    router.refresh();
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Main button */}
      <button
        type="button"
        onClick={() => active && setOpen((v) => !v)}
        disabled={toggling}
        className="btn-secondary !px-3 !gap-2"
      >
        <Globe
          size={16}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            active && setOpen((v) => !v);
          }}
        />

        {/* Toggle switch */}
        <span
          role="switch"
          aria-checked={active}
          onClick={handleToggle}
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer ${
            active ? "bg-signal" : "bg-black/20 dark:bg-white/20"
          }`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
              active ? "translate-x-[13px]" : "translate-x-[2px]"
            }`}
          />
        </span>

        {/* Share icon (only when active) */}
        {active && (
          <span
            onClick={handleShare}
            className="inline-flex items-center cursor-pointer text-muted hover:text-text transition-colors"
            title={copied ? "Copied!" : "Copy portal link"}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && active && (
        <div
          className="absolute right-0 top-full mt-1 w-64 rounded-md border border-border bg-panel shadow-lg z-50 py-2 px-3 space-y-1.5"
          style={{ background: "var(--panel)" }}
        >
          <ToggleRow
            label="Mix direction"
            checked={share!.show_direction}
            onChange={(v) => updateField("show_direction", v)}
          />
          <ToggleRow
            label="Specs"
            checked={share!.show_specs}
            onChange={(v) => updateField("show_specs", v)}
          />
          <ToggleRow
            label="References"
            checked={share!.show_references}
            onChange={(v) => updateField("show_references", v)}
          />
          <ToggleRow
            label="Payment status"
            checked={share!.show_payment_status}
            onChange={(v) => updateField("show_payment_status", v)}
          />
          <ToggleRow
            label="Distribution"
            checked={share!.show_distribution}
            onChange={(v) => updateField("show_distribution", v)}
          />
          <ToggleRow
            label="Require payment"
            checked={share!.require_payment_for_download}
            onChange={(v) => updateField("require_payment_for_download", v)}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle Row                                                         */
/* ------------------------------------------------------------------ */

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between text-xs cursor-pointer py-0.5">
      <span className="text-text">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
          checked ? "bg-signal" : "bg-black/20 dark:bg-white/20"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[13px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </label>
  );
}
