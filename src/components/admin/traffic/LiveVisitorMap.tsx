"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { VisitorLocation } from "@/lib/ga4-api";

const POLL_INTERVAL_MS = 30_000;

/** SVG viewBox: equirectangular projection, 720×360 */
const VB = "0 0 720 360";
const VB_W = 720;
const VB_H = 360;

/** Convert lat/lng → SVG coordinates (equirectangular = trivial linear mapping) */
function geoToSVG(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * VB_W,
    y: ((90 - lat) / 180) * VB_H,
  };
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
      // Silently fail — map just shows no dots
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

      {/* Map: background SVG + dot overlay sharing the same coordinate space */}
      <div className="relative bg-[#0a0f1a]" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
        {/* World map background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/world-map.svg)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* SVG overlay for dots */}
        <svg viewBox={VB} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* Visitor dots */}
          {locations.map((loc, i) => {
            const { x, y } = geoToSVG(loc.lat, loc.lng);
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={`${loc.lat}-${loc.lng}-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Pulse ring */}
                <circle cx={x} cy={y} r="6" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="1">
                  <animate attributeName="r" values="3;10;3" dur="2s" begin={`${(i * 0.3) % 2}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" begin={`${(i * 0.3) % 2}s`} repeatCount="indefinite" />
                </circle>

                {/* Core dot */}
                <circle
                  cx={x} cy={y}
                  r={isHovered ? 4 : 3}
                  fill="rgba(52,211,153,0.9)"
                  stroke="rgba(52,211,153,0.3)"
                  strokeWidth="1"
                />

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x + 6} y={y - 9}
                      width={Math.max((loc.city || loc.country || "Unknown").length * 4.5 + 10, 40)}
                      height={14} rx="3"
                      fill="rgba(0,0,0,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"
                    />
                    <text x={x + 11} y={y + 1} fill="white" fontSize="8" fontFamily="system-ui, sans-serif">
                      {loc.city ? `${loc.city}, ${loc.country}` : loc.country || "Unknown"}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1a]/80">
            <div className="text-xs text-muted animate-pulse">Loading visitor data...</div>
          </div>
        )}
      </div>
    </div>
  );
}
