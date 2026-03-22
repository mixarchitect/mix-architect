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

// ---------------------------------------------------------------------------
// Simplified world map path (Natural Earth 110m land outlines, heavily
// simplified). ~3KB of path data — just enough to be recognizable.
// ---------------------------------------------------------------------------
const WORLD_PATH = [
  // North America
  "M130,120 L135,105 140,100 155,95 165,90 180,88 195,90 210,95 220,100 225,108 230,115 232,125 228,135 222,145 218,155 212,160 205,165 195,168 185,170 178,172 170,178 162,185 155,188 148,185 142,180 138,170 135,160 132,150 130,140Z",
  // Central America + Caribbean
  "M170,185 L175,190 180,195 178,200 174,205 170,208 165,205Z",
  "M185,188 L190,185 195,188 192,192Z",
  // South America
  "M195,210 L205,205 215,208 225,215 230,225 235,240 238,255 240,270 238,285 235,295 230,305 222,315 215,320 208,318 200,310 195,300 192,285 190,270 188,255 190,240 192,225Z",
  // Europe
  "M370,100 L375,95 385,90 395,88 405,90 412,95 415,100 418,108 415,115 410,120 405,125 398,128 390,125 382,120 375,115 372,108Z",
  // British Isles
  "M362,95 L365,90 370,92 368,98 364,100Z",
  // Scandinavia
  "M390,70 L395,65 402,68 408,75 410,82 405,88 398,85 392,80Z",
  // Africa
  "M380,155 L390,148 400,150 410,155 418,162 425,170 430,180 432,195 430,210 428,225 425,240 420,255 415,265 408,272 400,275 392,270 385,262 380,250 375,238 372,225 370,210 372,195 375,180 378,168Z",
  // Middle East
  "M420,128 L430,125 440,128 448,135 445,142 438,148 430,150 422,145 418,138Z",
  // Russia / Northern Asia
  "M420,85 L440,78 460,75 480,72 500,70 520,68 540,70 560,72 575,75 585,80 590,88 585,95 575,98 560,95 540,92 520,90 500,88 480,85 460,82 440,80Z",
  // Central/South Asia
  "M450,120 L465,115 480,118 495,125 505,135 510,145 505,155 495,160 480,158 468,152 458,142 452,132Z",
  // East Asia
  "M540,100 L555,98 570,102 580,110 585,120 580,130 570,135 558,132 548,125 542,115Z",
  // Japan
  "M590,110 L595,105 598,110 596,118 592,120Z",
  // Southeast Asia
  "M530,155 L540,150 550,152 558,158 555,168 548,175 538,178 530,172 528,165Z",
  // Indonesia
  "M540,185 L548,182 555,185 560,188 555,192 548,190Z",
  "M562,188 L570,185 578,188 575,195 568,192Z",
  // Australia
  "M570,250 L585,242 600,240 615,242 625,248 630,258 628,270 620,280 610,285 598,282 585,278 575,270 572,260Z",
  // New Zealand
  "M640,285 L645,280 648,285 646,292 642,290Z",
].join(" ");

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
