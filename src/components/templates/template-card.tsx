"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, Copy, Star } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import type { ReleaseTemplate } from "@/types/template";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function typeLabel(t: string | null): string | null {
  if (!t) return null;
  if (t === "ep") return "EP";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function formatLabel(f: string | null): string | null {
  if (!f) return null;
  if (f === "stereo") return "Stereo";
  if (f === "atmos") return "Atmos";
  if (f === "both") return "Stereo + Atmos";
  return f;
}

/** Build a concise one-line summary from template fields */
function buildSummary(t: ReleaseTemplate): string {
  const parts: string[] = [];

  // Type + format combined
  const tf = [typeLabel(t.release_type), formatLabel(t.format)].filter(Boolean);
  if (tf.length > 0) parts.push(tf.join(" \u00B7 "));

  // Specs
  const specs = [t.default_sample_rate, t.default_bit_depth].filter(Boolean);
  if (specs.length > 0) parts.push(specs.join(" / "));

  // Delivery format count
  if (t.delivery_formats.length > 0)
    parts.push(`${t.delivery_formats.length} delivery format${t.delivery_formats.length !== 1 ? "s" : ""}`);

  return parts.join(" \u00B7 ") || "No settings configured";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Props = {
  template: ReleaseTemplate;
  className?: string;
};

export function TemplateCard({ template, className }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Click-outside + Escape
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirming(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setConfirming(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createSupabaseBrowserClient();
    try {
      const { error } = await supabase
        .from("release_templates")
        .delete()
        .eq("id", template.id);
      if (error) throw error;
      setMenuOpen(false);
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  async function handleDuplicate() {
    setDuplicating(true);
    const supabase = createSupabaseBrowserClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const {
        id: _id,
        user_id: _uid,
        created_at: _ca,
        updated_at: _ua,
        usage_count: _uc,
        last_used_at: _lu,
        is_default: _def,
        ...fields
      } = template;

      const { error } = await supabase
        .from("release_templates")
        .insert({
          ...fields,
          user_id: user.id,
          name: `${template.name} (copy)`,
          is_default: false,
        });
      if (error) throw error;
      toast("Template duplicated", { variant: "success" });
      setMenuOpen(false);
      router.refresh();
    } catch {
      toast("Failed to duplicate template", { variant: "error" });
    } finally {
      setDuplicating(false);
    }
  }

  return (
    <div className={cn("relative card px-5 py-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/app/templates/${template.id}`}
          className="group min-w-0 flex-1 focus-visible:outline-none"
        >
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-text truncate group-hover:text-signal transition-colors duration-150">
              {template.name}
            </div>
            {template.is_default && (
              <Star size={12} className="text-signal fill-current shrink-0" />
            )}
          </div>
          {template.description && (
            <div className="mt-0.5 text-sm text-muted truncate">
              {template.description}
            </div>
          )}

          {/* Single summary line */}
          <div className="mt-2 text-xs text-faint truncate">
            {buildSummary(template)}
          </div>
        </Link>

        {/* Action menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Template options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(!menuOpen);
              setConfirming(false);
            }}
            className={cn(
              "w-7 h-7 grid place-items-center rounded-md transition-colors",
              menuOpen
                ? "bg-panel2 text-text"
                : "text-faint hover:text-text hover:bg-panel2",
            )}
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1 w-44 rounded-md border border-border bg-panel shadow-lg py-1 text-sm z-20"
            >
              {!confirming ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(false);
                      router.push(`/app/templates/${template.id}`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-text hover:bg-panel2 transition-colors text-left"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDuplicate();
                    }}
                    disabled={duplicating}
                    className="w-full flex items-center gap-2 px-3 py-2 text-text hover:bg-panel2 transition-colors text-left disabled:opacity-50"
                  >
                    <Copy size={14} />
                    {duplicating ? "Duplicating\u2026" : "Duplicate"}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirming(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <p className="text-xs text-muted">
                    Delete{" "}
                    <strong className="text-text">{template.name}</strong>?
                    {template.usage_count > 0 && (
                      <> Used {template.usage_count} time{template.usage_count !== 1 ? "s" : ""}.</>
                    )}
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
  );
}
