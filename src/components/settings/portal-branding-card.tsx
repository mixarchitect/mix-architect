"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Upload, X, Check, ImageIcon, Lock, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useSubscription } from "@/lib/subscription-context";
import { getEntitlements } from "@/lib/entitlements";

const DEFAULT_ACCENT = "#0D9488";
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const LOGO_BUCKET = "workspace-logos";
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/**
 * Pro/Studio portal branding: studio logo + accent color applied to the
 * client portal. Gated on the `branding` entitlement — Free sees an
 * upgrade prompt.
 */
export function PortalBrandingCard() {
  const sub = useSubscription();
  const brandingLevel = getEntitlements(sub.plan).branding;
  const gated = brandingLevel === "none";

  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT);
  const [savedAccent, setSavedAccent] = useState<string>(DEFAULT_ACCENT);
  const [uploading, setUploading] = useState(false);
  const [savingAccent, setSavingAccent] = useState(false);
  const [error, setError] = useState("");

  const publicUrl = useCallback((path: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  }, []);

  // Load the owner's workspace + existing branding.
  useEffect(() => {
    if (gated) {
      setLoading(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: ws } = await supabase
          .from("workspaces")
          .select("id")
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (!ws) return;
        setWorkspaceId(ws.id);

        const { data: branding } = await supabase
          .from("workspace_branding")
          .select("logo_path, accent_color")
          .eq("workspace_id", ws.id)
          .maybeSingle();

        if (branding?.logo_path) {
          setLogoPath(branding.logo_path);
          setLogoUrl(publicUrl(branding.logo_path));
        }
        if (branding?.accent_color && HEX_RE.test(branding.accent_color)) {
          setAccent(branding.accent_color);
          setSavedAccent(branding.accent_color);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [gated, publicUrl]);

  async function upsertBranding(fields: { logo_path?: string | null; accent_color?: string }) {
    if (!workspaceId) return;
    const supabase = createSupabaseBrowserClient();
    const { error: upsertErr } = await supabase.from("workspace_branding").upsert(
      {
        workspace_id: workspaceId,
        logo_path: fields.logo_path !== undefined ? fields.logo_path : logoPath,
        accent_color: fields.accent_color !== undefined ? fields.accent_color : savedAccent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id" },
    );
    if (upsertErr) throw upsertErr;
  }

  async function handleUpload(file: File) {
    setError("");
    if (file.size > MAX_LOGO_BYTES) {
      setError("Logo must be under 5MB.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Use a PNG, JPG, WebP, or SVG image.");
      return;
    }
    setUploading(true);
    try {
      // All uploads go through the server route. It authenticates via cookies,
      // sanitizes SVGs, and writes both the file and the branding row with the
      // service client — so it never depends on the browser storage session,
      // which doesn't reliably attach the auth token (uploads would 400 on RLS).
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/workspace/logo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      const path: string = data.path;
      setLogoPath(path);
      setLogoUrl(publicUrl(path));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveLogo() {
    setError("");
    try {
      await upsertBranding({ logo_path: null });
      setLogoPath(null);
      setLogoUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove logo.");
    }
  }

  async function handleSaveAccent() {
    setError("");
    if (!HEX_RE.test(accent)) {
      setError("Enter a valid hex color, e.g. #0D9488.");
      return;
    }
    setSavingAccent(true);
    try {
      await upsertBranding({ accent_color: accent });
      setSavedAccent(accent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save color.");
    } finally {
      setSavingAccent(false);
    }
  }

  /* ── Gated (Free) ───────────────────────────────────────────────── */
  if (gated) {
    return (
      <div className="rounded-xl border border-border p-6" style={{ background: "var(--panel)" }}>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-muted" />
          <h2 className="text-sm font-semibold text-text">Portal branding</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          Add your logo and accent color to the client portal. Available on Pro and Studio.
        </p>
        <Link
          href="/app/settings?upgrade=branding"
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{ background: "var(--signal)", color: "var(--signal-on)" }}
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  /* ── Active (Pro/Studio) ────────────────────────────────────────── */
  const accentDirty = accent !== savedAccent;

  return (
    <div className="rounded-xl border border-border p-6 space-y-6" style={{ background: "var(--panel)" }}>
      <div>
        <h2 className="text-sm font-semibold text-text">Portal branding</h2>
        <p className="mt-1 text-sm text-muted">
          Your logo and accent color appear on the client portal.
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          {/* Logo */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Logo</span>
            <div className="flex items-center gap-4">
              <div
                className="w-28 h-16 rounded-md border border-border flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: "var(--panel-2)" }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Studio logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <ImageIcon size={20} className="text-muted opacity-30" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors w-fit"
                  style={{ background: "var(--panel-2)", color: "var(--text-muted)" }}
                >
                  <Upload size={14} />
                  {uploading ? "Uploading…" : logoUrl ? "Replace" : "Upload logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                    }}
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors w-fit"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
                <span className="text-[10px] text-faint">
                  SVG, PNG, JPG, or WebP · max 5MB · SVG (or a 2–3× PNG export) stays crisp on retina
                </span>
              </div>
            </div>
          </div>

          {/* Accent color */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Accent color</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={HEX_RE.test(accent) ? accent : DEFAULT_ACCENT}
                onChange={(e) => setAccent(e.target.value.toUpperCase())}
                className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent p-0"
                aria-label="Accent color picker"
              />
              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value.toUpperCase())}
                placeholder={DEFAULT_ACCENT}
                className="input text-sm w-32"
                maxLength={7}
              />
              <button
                type="button"
                onClick={handleSaveAccent}
                disabled={!accentDirty || savingAccent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
                style={{ background: "var(--signal)", color: "var(--signal-on)" }}
              >
                {savingAccent ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save
              </button>
            </div>
            <p className="text-[10px] text-faint">
              Used for buttons and highlights on the portal. Default is Mix Architect teal.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
