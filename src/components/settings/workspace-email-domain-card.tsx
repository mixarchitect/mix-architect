"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lock, Loader2, Check, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useSubscription } from "@/lib/subscription-context";
import { getEntitlements } from "@/lib/entitlements";

type DnsRecord = { type?: string; name?: string; value?: string; record?: string };
type DomainRow = { domain: string; status: string; dns_records: DnsRecord[] | null };

/**
 * Studio branded email: verify your own domain (Resend) so client emails send
 * from noreply@yourstudio.com. Gated on the `brandedEmail` entitlement.
 */
export function WorkspaceEmailDomainCard() {
  const sub = useSubscription();
  const gated = !getEntitlements(sub.plan).brandedEmail;

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<DomainRow | null>(null);
  const [domainInput, setDomainInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("workspace_email_domains")
      .select("domain, status, dns_records")
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
      const res = await fetch("/api/workspace/email-domain", {
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

  /* ── Gated ──────────────────────────────────────────────────────── */
  if (gated) {
    return (
      <div className="rounded-xl border border-border p-6" style={{ background: "var(--panel)" }}>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-muted" />
          <h2 className="text-sm font-semibold text-text">Branded email</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          Send client emails from your own domain (noreply@yourstudio.com). Available on Studio.
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

  /* ── Active (Studio) ────────────────────────────────────────────── */
  return (
    <div className="rounded-xl border border-border p-6 space-y-5" style={{ background: "var(--panel)" }}>
      <div>
        <h2 className="text-sm font-semibold text-text">Branded email</h2>
        <p className="mt-1 text-sm text-muted">
          Verify a domain so client emails send from your studio instead of Mix Architect.
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : !row ? (
        /* No domain yet — add one */
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
            placeholder="yourstudio.com"
            className="input text-sm flex-1"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
            style={{ background: "var(--signal)", color: "var(--signal-on)" }}
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
            Add domain
          </button>
        </form>
      ) : (
        <>
          {/* Status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text font-medium">{row.domain}</span>
            {verified ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                <Check size={12} /> Verified
              </span>
            ) : (
              <span className="text-xs font-medium uppercase tracking-wide text-amber-500">Pending</span>
            )}
          </div>

          {verified ? (
            <p className="text-xs text-muted">
              Client emails now send from <strong className="text-text">noreply@{row.domain}</strong>.
            </p>
          ) : (
            <>
              {/* DNS records to add */}
              {row.dns_records && row.dns_records.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted">
                    Add these DNS records at your domain registrar, then verify:
                  </p>
                  <div className="overflow-x-auto rounded-md border border-border" style={{ background: "var(--panel-2)" }}>
                    <table className="w-full text-[11px]">
                      <thead className="text-faint">
                        <tr>
                          <th className="text-left px-3 py-1.5 font-medium">Type</th>
                          <th className="text-left px-3 py-1.5 font-medium">Name</th>
                          <th className="text-left px-3 py-1.5 font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-text">
                        {row.dns_records.map((r, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="px-3 py-1.5 align-top">{r.type ?? r.record}</td>
                            <td className="px-3 py-1.5 align-top break-all">{r.name}</td>
                            <td className="px-3 py-1.5 align-top break-all">{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
