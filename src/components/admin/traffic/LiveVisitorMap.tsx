"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { VisitorLocation } from "@/lib/openpanel-api";

const POLL_INTERVAL_MS = 30_000;

// Map dimensions (2:1 equirectangular projection)
const MAP_W = 800;
const MAP_H = 400;

/** Convert lat/lng to SVG x/y using equirectangular projection */
function geoToXY(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * MAP_W,
    y: ((90 - lat) / 180) * MAP_H,
  };
}

import { WORLD_PATH } from "./world-map-path";

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
      // Silently fail — the map just shows no dots
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

      {/* Map */}
      <div className="relative bg-[#0a0f1a]">
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="w-full h-auto"
          style={{ aspectRatio: "2 / 1" }}
          aria-label="World map showing live visitor locations"
        >
          {/* Grid lines for visual reference */}
          <defs>
            <pattern
              id="map-grid"
              width={MAP_W / 12}
              height={MAP_H / 6}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${MAP_W / 12} 0 L 0 0 0 ${MAP_H / 6}`}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width={MAP_W} height={MAP_H} fill="url(#map-grid)" />

          {/* Equator line */}
          <line
            x1="0"
            y1={MAP_H / 2}
            x2={MAP_W}
            y2={MAP_H / 2}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
            strokeDasharray="4,4"
          />

          {/* World land outlines */}
          <path
            d={WORLD_PATH}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />

          {/* Visitor dots */}
          {locations.map((loc, i) => {
            const { x, y } = geoToXY(loc.lat, loc.lng);
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={`${loc.lat}-${loc.lng}-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Pulse ring */}
                <circle cx={x} cy={y} r="8" fill="none">
                  <animate
                    attributeName="r"
                    values="4;10;4"
                    dur="2s"
                    begin={`${(i * 0.3) % 2}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur="2s"
                    begin={`${(i * 0.3) % 2}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke"
                    values="rgba(52,211,153,0.6);rgba(52,211,153,0);rgba(52,211,153,0.6)"
                    dur="2s"
                    begin={`${(i * 0.3) % 2}s`}
                    repeatCount="indefinite"
                  />
                  <set attributeName="stroke" to="rgba(52,211,153,0.6)" />
                  <set attributeName="stroke-width" to="1" />
                </circle>

                {/* Core dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 4 : 3}
                  fill="rgba(52,211,153,0.9)"
                  stroke="rgba(52,211,153,0.3)"
                  strokeWidth="1"
                  className="transition-all duration-150"
                />

                {/* Tooltip label */}
                {isHovered && (
                  <g>
                    {/* Background rect */}
                    <rect
                      x={x + 8}
                      y={y - 12}
                      width={Math.max((loc.city || loc.country).length * 6.5 + 12, 50)}
                      height={20}
                      rx="4"
                      fill="rgba(0,0,0,0.85)"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={x + 14}
                      y={y + 2}
                      fill="white"
                      fontSize="10"
                      fontFamily="system-ui, sans-serif"
                    >
                      {loc.city
                        ? `${loc.city}, ${loc.country}`
                        : loc.country || "Unknown"}
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
            <div className="text-xs text-muted animate-pulse">
              Loading visitor data...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
