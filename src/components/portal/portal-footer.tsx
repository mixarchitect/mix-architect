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
  const hasPaymentData = showPayment && release.fee_total != null;
  const hasDistribution =
    showDistribution &&
    (releaseDistribution != null || tracks.some((t) => t.distribution != null));

  return (
    <div className="mt-8 space-y-4">
      {/* Payment status */}
      {hasPaymentData && (
        <div className="rounded-lg border border-border bg-panel px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] text-faint font-medium uppercase tracking-wider">
                Payment
              </div>
              <div className="text-xl font-bold text-text">
                {release.payment_status === "partial" && release.paid_amount ? (
                  <>
                    {formatCurrency(release.paid_amount, release.fee_currency)}
                    {" "}
                    <span className="text-muted font-normal text-sm">of</span>
                    {" "}
                    {formatCurrency(release.fee_total!, release.fee_currency)}
                  </>
                ) : (
                  formatCurrency(release.fee_total!, release.fee_currency)
                )}
              </div>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                release.payment_status === "paid"
                  ? "bg-status-green/10 text-status-green"
                  : release.payment_status === "partial"
                    ? "bg-signal-muted text-signal"
                    : "bg-black/[0.04] dark:bg-white/[0.06] text-muted"
              }`}
            >
              {release.payment_status === "paid"
                ? "Paid"
                : release.payment_status === "partial"
                  ? "Partial"
                  : "Unpaid"}
            </span>
          </div>
          {paymentGated && (
            <p className="text-xs text-muted mt-3">
              Final downloads will be available once payment is confirmed
              {engineerName ? ` by ${engineerName}` : ""}.
            </p>
          )}
        </div>
      )}

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
                      <span className="text-muted font-mono text-xs">
                        {String(t.track_number).padStart(2, "0")}
                      </span>
                      <span className="text-text">{t.title}</span>
                      <span className="text-faint font-mono text-xs ml-auto">
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
