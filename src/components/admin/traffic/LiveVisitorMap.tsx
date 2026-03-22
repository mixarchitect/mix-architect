"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { VisitorLocation } from "@/lib/openpanel-api";

const POLL_INTERVAL_MS = 30_000;

/**
 * The real-world SVG map uses a Robinson-like projection.
 * viewBox: 30.767 241.591 784.077 458.627
 * We use these to convert lat/lng → SVG coords.
 */
const VB_X = 30.767;
const VB_Y = 241.591;
const VB_W = 784.077;
const VB_H = 458.627;

/** Convert lat/lng to percentage position on the map container */
function geoToPercent(lat: number, lng: number): { x: number; y: number } {
  // Equirectangular → percentage of viewBox
  // Longitude: -180 to 180 → 0% to 100%
  const x = ((lng + 180) / 360) * 100;
  // Latitude: 90 to -90 → 0% to 100%  (note: SVG y is inverted)
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

export default function LiveVisitorMap() {
  const [locations, setLocations] = useState<VisitorLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/live");
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.locations)) {
        setLocations(json.locations);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    intervalRef.current = setInterval(fetchLocations, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLocations]);

  return (
    <div className="rounded-lg border border-border bg-panel overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <h2 className="text-sm font-semibold text-text">Live Visitors</h2>
        {!loading && (
          <span className="ml-auto text-xs text-muted">
            {locations.length === 0
              ? "No active visitors"
              : `${locations.length} visitor${locations.length !== 1 ? "s" : ""} in the last 30 min`}
          </span>
        )}
      </div>

      {/* Map container */}
      <div className="relative bg-[#0a0f1a]" style={{ aspectRatio: "2 / 1" }}>
        {/* Real world map SVG as background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/world-map.svg)",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Visitor dots overlaid on the map */}
        {locations.map((loc, i) => {
          const { x, y } = geoToPercent(loc.lat, loc.lng);
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={`${loc.lat}-${loc.lng}-${i}`}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Pulse ring */}
              <span
                className="absolute rounded-full bg-emerald-400/30 animate-ping"
                style={{
                  width: 20,
                  height: 20,
                  left: -10,
                  top: -10,
                  animationDelay: `${(i * 300) % 2000}ms`,
                  animationDuration: "2s",
                }}
              />
              {/* Core dot */}
              <span
                className={`relative block rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] transition-all duration-150 cursor-pointer ${
                  isHovered ? "w-3 h-3" : "w-2.5 h-2.5"
                }`}
              />
              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap z-10
                    bg-black/90 border border-white/15 text-white text-[11px] px-2.5 py-1 rounded-md
                    pointer-events-none"
                >
                  {loc.city
                    ? `${loc.city}, ${loc.country}`
                    : loc.country || "Unknown"}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1a]/80">
            <div className="text-xs text-muted animate-pulse">
              Loading visitor data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
