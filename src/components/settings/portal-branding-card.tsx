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

type LogoVariant = "light" | "dark";

/**
 * One logo upload slot (light or dark variant). The preview sits on a
 * representative background so the studio can judge contrast the way a client
 * will see it on the portal.
 */
function LogoSlot({
  label,
  hint,
  url,
  previewBg,
  uploading,
  onPick,
  onRemove,
}: {
  label: string;
  hint: string;
  url: string | null;
  previewBg: string;
  uploading: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className="w-28 h-16 rounded-md border border-border flex items-center justify-center overflow-hidden shrink-0"
          style={{ background: previewBg }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="max-w-full max-h-full object-contain" />
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
            {uploading ? "Uploading…" : url ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPick(f);
                e.target.value = "";
              }}
            />
          </label>
          {url && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors w-fit"
            >
              <X size={12} /> Remove
            </button>
          )}
          <span className="text-[10px] text-faint">{hint}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Pro/Studio portal branding: studio logo (light + optional dark variant) and
 * accent color applied to the client portal. Gated on the `branding`
 * entitlement — Free sees an upgrade prompt.
 */
export function PortalBrandingCard() {
  const sub = useSubscription();
  const brandingLevel = getEntitlements(sub.plan).branding;
  const gated = brandingLevel === "none";

  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUrlDark, setLogoUrlDark] = useState<string | null>(null);
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT);
  const [savedAccent, setSavedAccent] = useState<string>(DEFAULT_ACCENT);
  const [uploadingVariant, setUploadingVariant] = useState<LogoVariant | null>(null);
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
          .select("logo_path, logo_path_dark, accent_color")
          .eq("workspace_id", ws.id)
          .maybeSingle();

        if (branding?.logo_path) setLogoUrl(publicUrl(branding.logo_path));
        if (branding?.logo_path_dark) setLogoUrlDark(publicUrl(branding.logo_path_dark));
        if (branding?.accent_color && HEX_RE.test(branding.accent_color)) {
          setAccent(branding.accent_color);
          setSavedAccent(branding.accent_color);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [gated, publicUrl]);

  // Only the provided columns are written, so saving the accent never clobbers
  // a logo and removing one logo never touches the other.
  async function upsertBranding(fields: {
    logo_path?: string | null;
    logo_path_dark?: string | null;
    accent_color?: string;
  }) {
    if (!workspaceId) return;
    const supabase = createSupabaseBrowserClient();
    const { error: upsertErr } = await supabase.from("workspace_branding").upsert(
      { workspace_id: workspaceId, ...fields, updated_at: new Date().toISOString() },
      { onConflict: "workspace_id" },
    );
    if (upsertErr) throw upsertErr;
  }

  async function handleUpload(file: File, variant: LogoVariant) {
    setError("");
    if (file.size > MAX_LOGO_BYTES) {
      setError("Logo must be under 5MB.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Use a PNG, JPG, WebP, or SVG image.");
      return;
    }
    setUploadingVariant(variant);
    try {
      // The server route authenticates via cookies, sanitizes SVGs, and writes
      // both the file and the branding row with the service client — so it never
      // depends on the browser storage session (which doesn't reliably attach
      // the auth token, causing 400s on storage RLS).
      const fd = new FormData();
      fd.append("file", file);
      fd.append("variant", variant);
      const res = await fetch("/api/workspace/logo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      const url = publicUrl(data.path);
      if (variant === "dark") setLogoUrlDark(url);
      else setLogoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingVariant(null);
    }
  }

  async function handleRemoveLogo(variant: LogoVariant) {
    setError("");
    try {
      await upsertBranding(variant === "dark" ? { logo_path_dark: null } : { logo_path: null });
      if (variant === "dark") setLogoUrlDark(null);
      else setLogoUrl(null);
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
          {/* Logos — light + optional dark variant */}
          <div className="space-y-4">
            <LogoSlot
              label="Logo"
              hint="Shown on light backgrounds, and everywhere if no dark version is set."
              url={logoUrl}
              previewBg="#ffffff"
              uploading={uploadingVariant === "light"}
              onPick={(f) => handleUpload(f, "light")}
              onRemove={() => handleRemoveLogo("light")}
            />
            <LogoSlot
              label="Dark-mode logo"
              hint="Optional — shown when a client views the portal in dark mode."
              url={logoUrlDark}
              previewBg="#0b0d12"
              uploading={uploadingVariant === "dark"}
              onPick={(f) => handleUpload(f, "dark")}
              onRemove={() => handleRemoveLogo("dark")}
            />
            <p className="text-[10px] text-faint">
              SVG, PNG, JPG, or WebP · max 5MB · SVG (or a 2–3× PNG export) stays crisp on retina.
            </p>
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
