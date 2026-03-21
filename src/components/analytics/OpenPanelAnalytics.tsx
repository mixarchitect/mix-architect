"use client";

import { useEffect } from "react";

let opInitialized = false;

export function OpenPanelAnalytics() {
  useEffect(() => {
    if (opInitialized) return;
    if (typeof window === "undefined") return;

    const clientId = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;
    if (!clientId) return;

    // Only track in production
    if (window.location.hostname !== "mixarchitect.com") return;

    import("@openpanel/web").then(({ OpenPanel }) => {
      const op = new OpenPanel({
        clientId,
        apiUrl: "/stats/api",
        trackScreenViews: true,
        trackOutgoingLinks: true,
        trackAttributes: true,
      });

      (window as unknown as Record<string, unknown>).__op = op;
      opInitialized = true;
    });
  }, []);

  return null;
}
