import { cn } from "@/lib/cn";
import type { PortalRelease, PortalTrack, PortalReleaseDistribution } from "@/lib/portal-types";

type PortalFooterProps = {
  showPayment: boolean;
  release: PortalRelease;
  showDistribution: boolean;
  releaseDistribution: PortalReleaseDistribution | null;
  tracks: PortalTrack[];
  engineerName: string | null;
  paymentGated: boolean;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function PortalFooter({
  showPayment,
  release,
  showDistribution,
  releaseDistribution,
  tracks,
  engineerName,
  paymentGated,
}: PortalFooterProps) {
  const hasPaymentData =
    showPayment &&
    release.fee_total != null &&
    release.payment_status !== "no_fee";
  const hasDistribution =
    showDistribution &&
    (releaseDistribution != null || tracks.some((t) => t.distribution != null));

  return (
    <div className="mt-8 space-y-4">
      {/* Payment status */}
      {hasPaymentData && (() => {
        const isPaid = release.payment_status === "paid";
        const isPartial = release.payment_status === "partial";
        const outstanding = (release.fee_total ?? 0) - (release.paid_amount ?? 0);

        return (
          <div
            className="rounded-lg border border-border bg-panel overflow-hidden border-l-[3px]"
            style={{
              borderLeftColor: isPaid
                ? "var(--status-green)"
                : "var(--signal)",
            }}
          >
            {/* Colored header bar */}
            <div
              className={cn(
                "px-6 py-4",
                isPaid
                  ? "bg-status-green/[0.04] dark:bg-status-green/[0.06]"
                  : isPartial
                    ? "bg-signal/[0.03] dark:bg-signal/[0.05]"
                    : "",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] text-faint font-medium uppercase tracking-wider">
                    Payment
                  </div>
                  <div className="text-xl font-bold">
                    {isPartial && release.paid_amount ? (
                      <>
                        <span className="text-status-green">
                          {formatCurrency(release.paid_amount, release.fee_currency)}
                        </span>
                        {" "}
                        <span className="text-muted font-normal text-sm">of</span>
                        {" "}
                        <span className="text-text">
                          {formatCurrency(release.fee_total!, release.fee_currency)}
                        </span>
                      </>
                    ) : (
                      <span className={isPaid ? "text-status-green" : "text-text"}>
                        {formatCurrency(release.fee_total!, release.fee_currency)}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
                    isPaid && "bg-status-green/10 text-status-green",
                    isPartial && "bg-signal-muted text-signal",
                    !isPaid && !isPartial && "bg-black/[0.04] dark:bg-white/[0.06] text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isPaid && "bg-status-green",
                      isPartial && "bg-signal",
                      !isPaid && !isPartial && "bg-muted",
                    )}
                  />
                  {isPaid ? "Paid" : isPartial ? "Partial" : "Unpaid"}
                </span>
              </div>

              {/* Outstanding balance callout for partial/unpaid */}
              {!isPaid && outstanding > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-muted">Outstanding:</span>
                  <span className="font-semibold text-signal">
                    {formatCurrency(outstanding, release.fee_currency)}
                  </span>
                </div>
              )}
            </div>

            {paymentGated && (
              <div className="px-6 py-3 border-t border-border bg-black/[0.02] dark:bg-white/[0.02]">
                <p className="text-xs text-muted">
                  Final downloads will be available once payment is confirmed
                  {engineerName ? ` by ${engineerName}` : ""}.
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Distribution metadata */}
      {hasDistribution && (
        <div className="rounded-lg border border-border bg-panel px-6 py-5">
          <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-4">
            Distribution
          </div>

          {/* Release-level distribution */}
          {releaseDistribution && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mb-4">
              {releaseDistribution.upc && (
                <DistField label="UPC" value={releaseDistribution.upc} />
              )}
              {releaseDistribution.record_label && (
                <DistField label="Label" value={releaseDistribution.record_label} />
              )}
              {releaseDistribution.distributor && (
                <DistField label="Distributor" value={releaseDistribution.distributor} />
              )}
              {releaseDistribution.copyright_holder && (
                <DistField
                  label="Copyright"
                  value={`${releaseDistribution.copyright_holder}${releaseDistribution.copyright_year ? ` (${releaseDistribution.copyright_year})` : ""}`}
                />
              )}
              {releaseDistribution.phonogram_copyright && (
                <DistField label="Phonogram" value={releaseDistribution.phonogram_copyright} />
              )}
              {releaseDistribution.catalog_number && (
                <DistField label="Catalog #" value={releaseDistribution.catalog_number} />
              )}
            </div>
          )}

          {/* Per-track ISRCs */}
          {tracks.some((t) => t.distribution?.isrc) && (
            <div className="border-t border-border pt-3">
              <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-2">
                ISRC Codes
              </div>
              <div className="space-y-1">
                {tracks
                  .filter((t) => t.distribution?.isrc)
                  .map((t) => (
                    <div key={t.id} className="flex items-center gap-3 text-sm">
                      <span className="text-muted text-xs">
                        {String(t.track_number).padStart(2, "0")}
                      </span>
                      <span className="text-text">{t.title}</span>
                      <span className="text-faint text-xs ml-auto">
                        {t.distribution!.isrc}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Powered by footer */}
      <footer className="pt-8 pb-12 text-center space-y-2">
        <a
          href="https://mixarchitect.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 group"
        >
          <img
            src="/mix-architect-logo.svg"
            alt="Mix Architect"
            className="h-4 w-auto opacity-40 group-hover:opacity-60 transition-opacity"
          />
          <span className="text-xs text-faint group-hover:text-muted transition-colors">
            Powered by Mix Architect
          </span>
        </a>
        <div className="space-y-1">
          <div>
            <a
              href="https://mixarchitect.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-faint/60 hover:text-muted transition-colors"
            >
              Manage your releases &rarr;
            </a>
          </div>
          <div>
            <a
              href="https://mixarchitect.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-faint/60 hover:text-muted transition-colors"
            >
              Sign up to track all your projects in one place &rarr;
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DistField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-faint mb-0.5">{label}</div>
      <div className="text-sm font-medium text-text">{value}</div>
    </div>
  );
}
