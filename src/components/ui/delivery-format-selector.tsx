"use client";

import { useState } from "react";
import {
  Check,
  Download,
  Loader2,
  Info,
  Plus,
  ChevronDown,
  AlertCircle,
  Tag,
} from "lucide-react";
import type { EmbeddedMetadata } from "@/hooks/use-conversion";
import { Button } from "@/components/ui/button";
import type { AudioVersionData } from "@/components/ui/audio-player";
import type { ConversionJob } from "@/hooks/use-conversion";
import {
  DELIVERY_FORMATS,
  isConvertible,
  NON_CONVERTIBLE_FORMATS,
} from "@/lib/conversion-formats";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  /** All audio versions for this track (enables version selector) */
  audioVersions?: AudioVersionData[];
  /** Trigger conversion for a specific format + version */
  onConvert?: (format: string, version: AudioVersionData) => void;
  /** Get job status for a specific version + format */
  getJobStatus?: (
    audioVersionId: string,
    format: string,
  ) => ConversionJob | null;
};

/* ------------------------------------------------------------------ */
/*  Metadata tooltip labels                                            */
/* ------------------------------------------------------------------ */

const META_LABELS: Record<string, string> = {
  title: "Title",
  artist: "Artist",
  album: "Album",
  track: "Track",
  genre: "Genre",
  isrc: "ISRC",
  barcode: "UPC",
  date: "Year",
  copyright: "\u00A9",
  lyrics: "Lyrics",
  replaygain_track_gain: "Gain",
  encoded_by: "Encoder",
  comment: "Comment",
  artwork: "Art",
};

function formatMetaValue(key: string, val: string | boolean): string {
  if (key === "artwork") return "Cover embedded";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  // Truncate long values for tooltip
  if (val.length > 40) return val.slice(0, 37) + "...";
  return val;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DeliveryFormatSelector({
  value,
  onChange,
  disabled,
  audioVersions,
  onConvert,
  getJobStatus,
}: Props) {
  const [custom, setCustom] = useState("");

  // Selected version for export — default to latest
  const hasVersions = audioVersions && audioVersions.length > 0;
  const latestVersion = hasVersions
    ? audioVersions[audioVersions.length - 1]
    : null;
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    latestVersion?.id ?? null,
  );

  const selectedVersion =
    audioVersions?.find((v) => v.id === selectedVersionId) ?? latestVersion;

  const allFormats = [
    ...new Set([
      ...DELIVERY_FORMATS,
      ...value.filter((v) => !DELIVERY_FORMATS.includes(v)),
    ]),
  ];

  const hasSelectedConvertible = value.some((f) => isConvertible(f));

  function toggle(fmt: string) {
    const next = value.includes(fmt)
      ? value.filter((f) => f !== fmt)
      : [...value, fmt];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* ── Explainer ── */}
      <p className="text-[11px] text-muted leading-relaxed">
        Select the formats needed for this track.
        {hasVersions && hasSelectedConvertible && (
          <> Click <Download size={10} className="inline -mt-px mx-0.5" /> to export a converted file.</>
        )}
      </p>

      {/* ── Version selector (only when multiple versions exist) ── */}
      {hasVersions && audioVersions.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted">Export from:</span>
          <div className="relative">
            <select
              value={selectedVersion?.id ?? ""}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="appearance-none bg-panel-2 border border-border rounded-md pl-2.5 pr-7 py-1 text-[11px] text-text cursor-pointer hover:border-border-strong transition-colors focus:outline-none focus:border-signal"
            >
              {[...audioVersions].reverse().map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version_number}
                  {v.file_name ? ` — ${v.file_name}` : ""}
                  {v.id === latestVersion?.id ? " (latest)" : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={10}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* ── Format pills ── */}
      <div className="flex flex-wrap gap-2">
        {allFormats.map((fmt) => {
          const selected = value.includes(fmt);
          const convertible = isConvertible(fmt);
          const nonConvertibleTooltip = NON_CONVERTIBLE_FORMATS[fmt];
          const hasAudio = !!selectedVersion;
          const job = selectedVersion
            ? getJobStatus?.(selectedVersion.id, fmt)
            : null;
          const isConverting =
            job?.status === "requesting" ||
            job?.status === "pending" ||
            job?.status === "processing";
          const isComplete = job?.status === "completed";
          const isFailed = job?.status === "failed";
          const canExport =
            selected && convertible && hasAudio && onConvert;

          return (
            <div
              key={fmt}
              className="group relative inline-flex items-center"
            >
              {/* ── Selection pill ── */}
              <button
                type="button"
                onClick={() => !disabled && toggle(fmt)}
                disabled={disabled}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  isFailed
                    ? "bg-red-500/10 border-red-500/50 text-red-400"
                    : selected
                      ? "bg-signal/10 border-signal text-signal"
                      : "border-border text-muted hover:text-text hover:border-border-strong"
                } ${disabled ? "opacity-60 cursor-default" : ""}`}
              >
                {/* Status icon */}
                {isConverting && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                {isFailed && <AlertCircle size={12} />}
                {!isConverting && !isFailed && isComplete && (
                  <Check size={12} />
                )}
                {!isConverting && !isFailed && !isComplete && selected && (
                  <Check size={12} />
                )}

                {fmt}

                {/* Non-convertible info icon with tooltip */}
                {nonConvertibleTooltip && (
                  <span className="relative ml-0.5">
                    <Info size={10} className="text-muted" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 text-[11px] text-text bg-panel border border-border rounded-md shadow-float opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 leading-snug">
                      {nonConvertibleTooltip}
                    </span>
                  </span>
                )}
              </button>

              {/* ── Export button — always visible when exportable ── */}
              {canExport && !isConverting && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConvert(fmt, selectedVersion);
                  }}
                  className="ml-0.5 p-0.5 rounded text-signal hover:text-signal/70 transition-opacity"
                  title={
                    isFailed
                      ? `Retry export as ${fmt}`
                      : `Export as ${fmt}`
                  }
                >
                  <Download size={12} />
                </button>
              )}

              {/* ── Metadata indicator (on completed conversions) ── */}
              {isComplete && job?.embeddedMetadata && (
                <span className="relative ml-0.5">
                  <Tag size={10} className="text-signal/60" />
                  <span className="absolute bottom-full right-0 mb-2 w-52 px-3 py-2 text-[11px] text-text bg-panel border border-border rounded-md shadow-float opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 leading-snug">
                    <span className="font-medium text-signal block mb-1">Embedded metadata</span>
                    {Object.entries(job.embeddedMetadata as EmbeddedMetadata)
                      .filter(([key]) => key !== "encoded_by" && key !== "comment")
                      .map(([key, val]) => (
                        <span key={key} className="flex justify-between gap-2">
                          <span className="text-muted">{META_LABELS[key] ?? key}</span>
                          <span className="text-text truncate text-right max-w-[120px]">
                            {key === "artwork" ? (
                              <span className="text-signal">Cover embedded</span>
                            ) : (
                              formatMetaValue(key, val)
                            )}
                          </span>
                        </span>
                      ))}
                  </span>
                </span>
              )}

              {/* ── Error tooltip ── */}
              {isFailed && job?.errorMessage && (
                <span className="absolute top-full left-0 mt-1 w-56 px-3 py-2 text-[11px] text-red-300 bg-panel border border-red-500/30 rounded-md shadow-float opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 leading-snug">
                  {job.errorMessage}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── No audio hint ── */}
      {!hasVersions && value.length > 0 && value.some((f) => isConvertible(f)) && (
        <p className="text-[11px] text-muted/60 flex items-center gap-1">
          <Info size={10} />
          Upload audio to enable format export
        </p>
      )}

      {/* ── Custom format input ── */}
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.trim()) {
                toggle(custom.trim().toUpperCase());
                setCustom("");
              }
            }}
            placeholder="Custom format..."
            className="input text-sm h-9 flex-1"
          />
          <Button
            variant="ghost"
            onClick={() => {
              if (custom.trim()) {
                toggle(custom.trim().toUpperCase());
                setCustom("");
              }
            }}
            disabled={!custom.trim()}
            className="h-9 text-xs"
          >
            <Plus size={14} />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
