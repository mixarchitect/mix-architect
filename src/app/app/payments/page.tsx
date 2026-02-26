import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { formatMoney } from "@/lib/format-money";
import { PaymentsTable } from "./payments-table";
import { PaymentsActions } from "./payments-actions";
import type { PaymentRelease, PaymentSummary } from "@/lib/db-types";

export default async function PaymentsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // Verify payments are enabled for this user
  const { data: defaults } = await supabase
    .from("user_defaults")
    .select("payments_enabled")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!defaults?.payments_enabled) redirect("/app");

  // Fetch owned releases with fee data
  const { data: rawReleases } = await supabase
    .from("releases")
    .select(
      "id, title, artist, fee_total, fee_currency, payment_status, paid_amount, payment_notes, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .neq("payment_status", "no_fee")
    .order("updated_at", { ascending: false });

  const releaseIds = (rawReleases ?? []).map((r) => r.id as string);

  // Fetch all tracks for those releases in one query
  const { data: rawTracks } =
    releaseIds.length > 0
      ? await supabase
          .from("tracks")
          .select("id, title, track_number, fee, fee_paid, release_id")
          .in("release_id", releaseIds)
          .order("track_number")
      : { data: [] as Record<string, unknown>[] };

  // Build typed data
  type RawTrack = { id: unknown; title: unknown; track_number: unknown; fee: unknown; fee_paid: unknown; release_id: unknown };
  const tracksByRelease = new Map<string, RawTrack[]>();
  for (const t of (rawTracks ?? []) as RawTrack[]) {
    const rid = t.release_id as string;
    if (!tracksByRelease.has(rid)) tracksByRelease.set(rid, []);
    tracksByRelease.get(rid)!.push(t);
  }

  let outstandingTotal = 0;
  let earnedTotal = 0;
  let grandTotal = 0;
  let outstandingCount = 0;
  let paidCount = 0;
  let primaryCurrency = "USD";

  const releases: PaymentRelease[] = (rawReleases ?? []).map((r, idx) => {
    const fee = (r.fee_total as number) ?? 0;
    const paid = (r.paid_amount as number) ?? 0;
    const status = r.payment_status as "unpaid" | "partial" | "paid";
    const cur = (r.fee_currency as string) || "USD";

    if (idx === 0) primaryCurrency = cur;
    grandTotal += fee;
    if (status === "paid") {
      earnedTotal += fee;
      paidCount++;
    } else {
      outstandingTotal += fee - paid;
      earnedTotal += paid;
      outstandingCount++;
    }

    const relTracks = tracksByRelease.get(r.id as string) ?? [];

    return {
      id: r.id as string,
      title: r.title as string,
      artist: (r.artist as string) ?? null,
      feeTotal: fee,
      feeCurrency: cur,
      paymentStatus: status,
      paidAmount: paid,
      paymentNotes: (r.payment_notes as string) ?? null,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
      tracks: relTracks.map((t) => ({
        id: t.id as string,
        title: t.title as string,
        trackNumber: t.track_number as number,
        fee: (t.fee as number) ?? null,
        feePaid: (t.fee_paid as boolean) ?? false,
      })),
    };
  });

  const summary: PaymentSummary = {
    outstandingTotal,
    earnedTotal,
    grandTotal,
    outstandingCount,
    paidCount,
    totalCount: releases.length,
    primaryCurrency,
  };

  return (
    <div>
      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-xl font-bold text-text">Payment Summary</h1>
        <p className="text-sm text-muted">
          Generated{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Screen header */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <h1 className="text-2xl font-semibold h2 text-text">Payments</h1>
        <PaymentsActions releases={releases} summary={summary} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 print:grid-cols-3">
        <div className="px-4 py-3 rounded-lg border border-border bg-panel">
          <div className="text-[10px] uppercase tracking-wide text-faint font-medium mb-1">
            Outstanding
          </div>
          <div className={outstandingTotal > 0 ? "text-lg font-semibold text-signal font-mono" : "text-lg font-semibold text-text font-mono"}>
            {formatMoney(outstandingTotal, primaryCurrency)}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {outstandingCount} release{outstandingCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="px-4 py-3 rounded-lg border border-border bg-panel">
          <div className="text-[10px] uppercase tracking-wide text-faint font-medium mb-1">
            Earned
          </div>
          <div className="text-lg font-semibold text-text font-mono">
            {formatMoney(earnedTotal, primaryCurrency)}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {paidCount} release{paidCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="px-4 py-3 rounded-lg border border-border bg-panel">
          <div className="text-[10px] uppercase tracking-wide text-faint font-medium mb-1">
            Total Fees
          </div>
          <div className="text-lg font-semibold text-text font-mono">
            {formatMoney(grandTotal, primaryCurrency)}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {releases.length} release{releases.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel border border-border rounded-lg shadow-sm print:shadow-none print:border-none print:rounded-none">
        <PaymentsTable releases={releases} currency={primaryCurrency} />
      </div>

      {/* Print footer */}
      <div className="hidden print:flex items-center justify-center gap-2 mt-8">
        <img src="/mix-architect-logo.svg" alt="Mix Architect" className="h-4 w-auto opacity-40" />
        <span className="text-xs text-faint">· mixarchitect.com</span>
      </div>
    </div>
  );
}
