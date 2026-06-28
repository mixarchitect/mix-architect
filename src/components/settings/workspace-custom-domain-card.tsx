"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lock, Loader2, Check, Globe, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useSubscription } from "@/lib/subscription-context";
import { getEntitlements } from "@/lib/entitlements";

type VerificationRec = { type?: string; domain?: string; value?: string };
type DomainRow = { domain: string; status: string; verification: VerificationRec[] | null };

/**
 * Studio custom portal domain: serve client portals at the studio's own domain
 * (e.g. portal.theirstudio.com/portal/<token>). Gated on `customDomain`.
 */
export function WorkspaceCustomDomainCard() {
  const sub = useSubscription();
  const gated = !getEntitlements(sub.plan).customDomain;

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<DomainRow | null>(null);
  const [domainInput, setDomainInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("workspace_custom_domains")
      .select("domain, status, verification")
      .maybeSingle();
    setRow((data as DomainRow | null) ?? null);
  }, []);

  useEffect(() => {
    if (gated) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [gated, load]);

  async function call(payload: object) {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/workspace/custom-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  if (gated) {
    return (
      <div className="rounded-xl border border-border p-6" style={{ background: "var(--panel)" }}>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-muted" />
          <h2 className="text-sm font-semibold text-text">Custom portal domain</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          Serve client portals on your own domain (portal.yourstudio.com). Available on Studio.
        </p>
        <Link
          href="/app/settings?upgrade=studio"
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{ background: "var(--signal)", color: "var(--signal-on)" }}
        >
          Upgrade to Studio
        </Link>
      </div>
    );
  }

  const verified = row?.status === "verified";

  return (
    <div className="rounded-xl border border-border p-6 space-y-5" style={{ background: "var(--panel)" }}>
      <div>
        <h2 className="text-sm font-semibold text-text">Custom portal domain</h2>
        <p className="mt-1 text-sm text-muted">
          Serve client portals on your own domain instead of mixarchitect.com.
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : !row ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            call({ action: "add", domain: domainInput.trim() });
          }}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            required
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="portal.yourstudio.com"
            className="input text-sm flex-1"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
            style={{ background: "var(--signal)", color: "var(--signal-on)" }}
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
            Add domain
          </button>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text font-medium">{row.domain}</span>
            {verified ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                <Check size={12} /> Verified
              </span>
            ) : (
              <span className="text-xs font-medium uppercase tracking-wide text-amber-500">Pending DNS</span>
            )}
            <button
              type="button"
              onClick={() => call({ action: "remove" })}
              disabled={busy}
              className="ml-auto text-muted hover:text-red-500 transition-colors"
              aria-label="Remove domain"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {verified ? (
            <p className="text-xs text-muted">
              Portals are live at{" "}
              <strong className="text-text">https://{row.domain}/portal/&lt;link&gt;</strong>.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-xs text-muted">Point your domain at Vercel, then verify:</p>
                <div className="rounded-md border border-border p-3 font-mono text-[11px] text-text space-y-1" style={{ background: "var(--panel-2)" }}>
                  <div>Subdomain → CNAME → <span className="text-signal">cname.vercel-dns.com</span></div>
                  <div>Apex domain → A → <span className="text-signal">76.76.21.21</span></div>
                </div>
                {row.verification && row.verification.length > 0 && (
                  <div className="rounded-md border border-border p-3 font-mono text-[11px] text-text space-y-1" style={{ background: "var(--panel-2)" }}>
                    <div className="text-faint mb-1">Plus this verification record:</div>
                    {row.verification.map((v, i) => (
                      <div key={i} className="break-all">
                        {v.type} {v.domain} → {v.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => call({ action: "verify" })}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
                style={{ background: "var(--signal)", color: "var(--signal-on)" }}
              >
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Verify domain
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
