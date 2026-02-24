import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReleaseCard } from "@/components/ui/release-card";
import { StatTile } from "@/components/ui/stat-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus } from "lucide-react";

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  let paymentsEnabled = false;
  if (user) {
    const { data: defaults } = await supabase
      .from("user_defaults")
      .select("payments_enabled")
      .eq("user_id", user.id)
      .maybeSingle();
    paymentsEnabled = defaults?.payments_enabled ?? false;
  }

  const { data: releases } = await supabase
    .from("releases")
    .select("*, tracks(id, status)")
    .order("updated_at", { ascending: false });

  let outstandingTotal = 0;
  let outstandingCount = 0;
  let earnedTotal = 0;
  let earnedCount = 0;
  let feeGrandTotal = 0;
  let feeReleaseCount = 0;
  let primaryCurrency = "USD";

  if (releases) {
    for (const r of releases) {
      const fee = r.fee_total as number | null;
      const status = (r.payment_status as string) ?? "unpaid";
      if (fee != null) {
        if (!feeReleaseCount) primaryCurrency = (r.fee_currency as string) || "USD";
        feeReleaseCount++;
        feeGrandTotal += fee;
        if (status === "paid") {
          earnedTotal += fee;
          earnedCount++;
        } else {
          outstandingTotal += fee;
          outstandingCount++;
        }
      }
    }
  }

  const hasAnyFees = feeReleaseCount > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold h2 text-text">Your Releases</h1>
        <Link href="/app/releases/new">
          <Button variant="primary">
            <Plus size={16} />
            New Release
          </Button>
        </Link>
      </div>

      {paymentsEnabled && hasAnyFees && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatTile
            variant="accent"
            label="OUTSTANDING"
            value={formatMoney(outstandingTotal, primaryCurrency)}
            note={`${outstandingCount} release${outstandingCount !== 1 ? "s" : ""}`}
          />
          <StatTile
            label="EARNED"
            value={formatMoney(earnedTotal, primaryCurrency)}
            note={`${earnedCount} release${earnedCount !== 1 ? "s" : ""}`}
          />
          <StatTile
            label="TOTAL"
            value={formatMoney(feeGrandTotal, primaryCurrency)}
            note={`${earnedCount} of ${feeReleaseCount} paid`}
          />
        </div>
      )}

      {releases && releases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {releases.map((r: Record<string, unknown> & { tracks?: { id: string; status: string }[] }) => {
            const trackCount = r.tracks?.length ?? 0;
            const completedTracks =
              r.tracks?.filter((t) => t.status === "complete").length ?? 0;
            return (
              <ReleaseCard
                key={r.id as string}
                id={r.id as string}
                title={r.title as string}
                artist={r.artist as string | null}
                releaseType={r.release_type as string}
                format={r.format as string}
                status={r.status as string}
                trackCount={trackCount}
                completedTracks={completedTracks}
                updatedAt={r.updated_at as string | null}
                paymentsEnabled={paymentsEnabled}
                paymentStatus={r.payment_status as string | null}
                feeTotal={r.fee_total as number | null}
                feeCurrency={r.fee_currency as string | null}
                coverArtUrl={r.cover_art_url as string | null}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No releases yet"
          description="Create your first release to start planning your mix."
          action={
            <Link href="/app/releases/new">
              <Button variant="primary">
                <Plus size={16} />
                Create Release
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
