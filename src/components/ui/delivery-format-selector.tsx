"use client";

import { useState } from "react";
import { Check, Download, Loader2, Info, Plus } from "lucide-react";
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
  /** The latest audio version for this track (enables export) */
  activeAudioVersion?: AudioVersionData | null;
  /** Trigger conversion for a specific format */
  onConvert?: (format: string) => void;
  /** Active conversion jobs keyed by "versionId:format" */
  getJobStatus?: (format: string) => ConversionJob | null;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DeliveryFormatSelector({
  value,
  onChange,
  disabled,
  activeAudioVersion,
  onConvert,
  getJobStatus,
}: Props) {
  const [custom, setCustom] = useState("");
  const allFormats = [
    ...new Set([
      ...DELIVERY_FORMATS,
      ...value.filter((v) => !DELIVERY_FORMATS.includes(v)),
    ]),
  ];

  function toggle(fmt: string) {
    const next = value.includes(fmt)
      ? value.filter((f) => f !== fmt)
      : [...value, fmt];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allFormats.map((fmt) => {
          const selected = value.includes(fmt);
          const convertible = isConvertible(fmt);
          const nonConvertibleTooltip = NON_CONVERTIBLE_FORMATS[fmt];
          const hasAudio = !!activeAudioVersion;
          const job = getJobStatus?.(fmt);
          const isConverting =
            job?.status === "requesting" ||
            job?.status === "pending" ||
            job?.status === "processing";
          const isComplete = job?.status === "completed";
          const showExport =
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
                  selected
                    ? "bg-signal/10 border-signal text-signal"
                    : "border-border text-muted hover:text-text hover:border-border-strong"
                } ${disabled ? "opacity-60 cursor-default" : ""}`}
              >
                {/* Check or status icon */}
                {isConverting && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                {!isConverting && isComplete && <Check size={12} />}
                {!isConverting && !isComplete && selected && (
                  <Check size={12} />
                )}

                {fmt}

                {/* Non-convertible info icon */}
                {nonConvertibleTooltip && (
                  <span className="relative ml-0.5">
                    <Info size={10} className="text-muted" />
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 text-[11px] text-text bg-panel border border-border rounded-md shadow-float opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 leading-snug">
                      {nonConvertibleTooltip}
                    </span>
                  </span>
                )}
              </button>

              {/* ── Export button (hover-visible) ── */}
              {showExport && !isConverting && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConvert(fmt);
                  }}
                  className="ml-0.5 p-0.5 rounded text-signal opacity-0 group-hover:opacity-100 hover:opacity-70 transition-opacity"
                  title={`Export as ${fmt}`}
                >
                  <Download size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

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
