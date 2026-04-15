"use client";

import type { AttributionSource } from "@/types/attribution";

type PoweredByBannerProps = {
  engineerId: string;
};

/**
 * "Powered by Mix Architect" footer banner for client-facing portal pages.
 * On CTA click, fires an attribution tracking call (fire-and-forget)
 * then opens the landing page in a new tab.
 */
export function PoweredByBanner({ engineerId }: PoweredByBannerProps) {
  function handleClick(source: AttributionSource) {
    // Fire-and-forget: don't block navigation on tracking
    fetch("/api/attributions/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engineer_id: engineerId,
        source,
        page_type: "delivery_portal",
      }),
    }).catch(() => {
      // Silent failure: attribution tracking should never block UX
    });
  }

  return (
    <footer className="pt-8 pb-12 text-center space-y-2">
      <a
        href="https://mixarchitect.com"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleClick("portal_branding")}
        className="inline-flex items-center gap-2 group"
      >
        <span className="text-xs text-[rgba(255,255,255,0.4)] group-hover:text-[rgba(255,255,255,0.6)] transition-colors">
          Powered by
        </span>
        <img
          src="/mixarchvert1whitetextoutline.svg"
          alt="Mix Architect"
          className="h-4 w-auto opacity-60 group-hover:opacity-80 transition-opacity"
        />
      </a>
      <div>
        <a
          href="https://mixarchitect.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick("portal_branding")}
          className="inline-flex items-center gap-1 text-[11px] text-teal-500/70 hover:text-teal-500 transition-colors font-medium"
        >
          Try it free
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </footer>
  );
}
