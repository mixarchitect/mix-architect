"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, Music } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { StatusDot } from "@/components/ui/status-dot";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  title: string;
  artist?: string | null;
  releaseType: string;
  format: string;
  status: string;
  trackCount: number;
  completedTracks: number;
  updatedAt?: string | null;
  paymentStatus?: string | null;
  feeTotal?: number | null;
  feeCurrency?: string | null;
  paymentsEnabled?: boolean;
  coverArtUrl?: string | null;
  className?: string;
};

function statusColor(status: string): "green" | "orange" | "blue" {
  if (status === "ready") return "green";
  if (status === "in_progress") return "orange";
  return "blue";
}

function formatLabel(f: string | undefined | null): string {
  if (!f) return "Stereo";
  if (f === "atmos") return "Dolby Atmos";
  if (f === "both") return "Stereo + Atmos";
  return "Stereo";
}

function typeLabel(t: string | undefined | null): string {
  if (!t) return "\u2014";
  if (t === "ep") return "EP";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ReleaseCard({
  id, title, artist, releaseType, format, status,
  trackCount, completedTracks, updatedAt,
  paymentStatus, feeTotal, feeCurrency, paymentsEnabled,
  coverArtUrl, className,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirming(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("releases").delete().eq("id", id);
    setMenuOpen(false);
    router.refresh();
  }

  return (
    <div className={cn("relative card px-5 py-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/app/releases/${id}`}
          className="group min-w-0 flex-1 focus-visible:outline-none flex items-start gap-3"
        >
          <div
            className="w-10 h-10 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ background: "var(--panel2)" }}
          >
            {coverArtUrl ? (
              <img src={coverArtUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music size={18} className="text-muted opacity-30" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-text truncate group-hover:text-signal transition-colors duration-150">
              {title}
            </div>
            <div className="mt-0.5 text-sm text-muted truncate">{artist || "\u2014"}</div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          <StatusDot color={statusColor(status)} />
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
                setConfirming(false);
              }}
              className="w-7 h-7 grid place-items-center rounded-md text-faint hover:text-text hover:bg-panel2 transition-colors"
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-md border border-border bg-panel shadow-lg py-1 text-sm z-20">
                {!confirming ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen(false);
                        router.push(`/app/releases/${id}/settings`);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-text hover:bg-panel2 transition-colors text-left"
                    >
                      <Pencil size={14} />
                      Edit Release
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirming(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 size={14} />
                      Delete Release
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-2 space-y-2">
                    <p className="text-xs text-muted">
                      Delete <strong className="text-text">{title}</strong>? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={deleting}
                        className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                      >
                        {deleting ? "Deleting\u2026" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirming(false);
                        }}
                        className="flex-1 px-2 py-1.5 text-xs font-medium text-muted hover:text-text border border-border rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Link
        href={`/app/releases/${id}`}
        className="group block focus-visible:outline-none"
      >
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill>{typeLabel(releaseType)}</Pill>
          <Pill>{formatLabel(format)}</Pill>
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
          <span className="font-mono">
            {completedTracks} of {trackCount} track{trackCount !== 1 ? "s" : ""} briefed
          </span>
          <div className="flex items-center gap-2">
            {paymentsEnabled && paymentStatus && (
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                paymentStatus === "paid" && "bg-green-100 text-green-700",
                paymentStatus === "partial" && "bg-amber-100 text-amber-700",
                paymentStatus === "unpaid" && "bg-zinc-100 text-zinc-500",
              )}>
                {paymentStatus === "paid" ? "Paid" : paymentStatus === "partial" ? "Partial" : "Unpaid"}
                {feeTotal != null && ` \u2022 ${new Intl.NumberFormat("en-US", { style: "currency", currency: feeCurrency || "USD" }).format(feeTotal)}`}
              </span>
            )}
            {updatedAt && <span>{relativeTime(updatedAt)}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}
