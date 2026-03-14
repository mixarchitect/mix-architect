"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { DateRangeCalendar } from "./DateRangeCalendar";
import {
  type PresetKey,
  type CompareKey,
  PRESET_OPTIONS,
  COMPARE_OPTIONS,
  resolvePreset,
  formatDateShort,
  formatDateISO,
  parseDateISO,
  startOfDay,
  endOfDay,
} from "@/lib/admin-date-utils";

interface Props {
  range: string;
  from?: string;
  to?: string;
  compare?: string;
}

export function DashboardRangeSelector({ range, from, to, compare }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  // Draft state (not applied until "Apply")
  const [draftPreset, setDraftPreset] = useState<PresetKey | "custom">(
    isPresetKey(range) ? range : from && to ? "custom" : "today",
  );
  const [draftFrom, setDraftFrom] = useState<Date | null>(() => {
    if (from) return parseDateISO(from);
    const p = resolvePreset(isPresetKey(range) ? range : "today");
    return p.from;
  });
  const [draftTo, setDraftTo] = useState<Date | null>(() => {
    if (to) return parseDateISO(to);
    const p = resolvePreset(isPresetKey(range) ? range : "today");
    return p.to;
  });
  const [draftCompare, setDraftCompare] = useState<CompareKey>(
    isCompareKey(compare) ? compare : "none",
  );

  // Compute display label for the trigger button
  const triggerLabel = (() => {
    if (isPresetKey(range)) {
      return PRESET_OPTIONS.find((p) => p.key === range)?.label ?? "Today";
    }
    if (from && to) {
      const f = parseDateISO(from);
      const t = parseDateISO(to);
      if (f && t) return `${formatDateShort(f)} - ${formatDateShort(t)}`;
    }
    return "Today";
  })();

  // Click-outside
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Reset draft state when opening
  const handleOpen = useCallback(() => {
    setDraftPreset(isPresetKey(range) ? range : from && to ? "custom" : "today");
    if (from) setDraftFrom(parseDateISO(from));
    else {
      const p = resolvePreset(isPresetKey(range) ? range : "today");
      setDraftFrom(p.from);
    }
    if (to) setDraftTo(parseDateISO(to));
    else {
      const p = resolvePreset(isPresetKey(range) ? range : "today");
      setDraftTo(p.to);
    }
    setDraftCompare(isCompareKey(compare) ? compare : "none");
    setOpen(true);
  }, [range, from, to, compare]);

  const handlePresetClick = useCallback((key: PresetKey) => {
    setDraftPreset(key);
    const { from: f, to: t } = resolvePreset(key);
    setDraftFrom(f);
    setDraftTo(t);
  }, []);

  const handleCalendarChange = useCallback(
    (f: Date | null, t: Date | null) => {
      setDraftFrom(f);
      setDraftTo(t);
      setDraftPreset("custom");
    },
    [],
  );

  const handleApply = useCallback(() => {
    const params = new URLSearchParams();

    if (draftPreset !== "custom") {
      params.set("range", draftPreset);
    } else if (draftFrom && draftTo) {
      params.set("range", "custom");
      params.set("from", formatDateISO(draftFrom));
      params.set("to", formatDateISO(draftTo));
    } else {
      params.set("range", "today");
    }

    if (draftCompare !== "none") {
      params.set("compare", draftCompare);
    }

    router.push(`/admin?${params.toString()}`);
    setOpen(false);
  }, [router, draftPreset, draftFrom, draftTo, draftCompare]);

  const canApply = draftFrom !== null && draftTo !== null;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border transition-colors",
          open
            ? "border-amber-500/50 text-amber-500 bg-amber-600/10"
            : "border-border text-muted hover:text-text hover:bg-panel2",
        )}
      >
        <Calendar size={14} />
        <span>{triggerLabel}</span>
        <ChevronDown
          size={12}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 rounded-lg border border-border shadow-xl"
          style={{ background: "var(--panel)" }}
        >
          {/* Date inputs */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border">
            <input
              type="text"
              readOnly
              value={draftFrom ? formatDateShort(draftFrom) : "Start date"}
              className="flex-1 px-3 py-1.5 text-xs rounded-md border border-border bg-panel2 text-text outline-none"
            />
            <span className="text-faint text-xs">&#8594;</span>
            <input
              type="text"
              readOnly
              value={draftTo ? formatDateShort(draftTo) : "End date"}
              className="flex-1 px-3 py-1.5 text-xs rounded-md border border-border bg-panel2 text-text outline-none"
            />
          </div>

          {/* Presets + Calendar */}
          <div className="flex">
            {/* Preset column */}
            <div className="w-[160px] border-r border-border py-2">
              {PRESET_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handlePresetClick(opt.key)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2 text-xs transition-colors text-left",
                    draftPreset === opt.key
                      ? "bg-amber-600/10 text-amber-500 font-medium"
                      : "text-text hover:bg-panel2",
                  )}
                >
                  {opt.label}
                  {draftPreset === opt.key && (
                    <Check size={14} className="text-amber-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <div className="p-4">
              <DateRangeCalendar
                from={draftFrom}
                to={draftTo}
                onChange={handleCalendarChange}
              />
            </div>
          </div>

          {/* Comparison + Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Compare:</span>
              <select
                value={draftCompare}
                onChange={(e) =>
                  setDraftCompare(e.target.value as CompareKey)
                }
                className="text-xs px-2 py-1 rounded-md border border-border bg-panel2 text-text outline-none"
              >
                {COMPARE_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-xs rounded-md text-muted hover:text-text hover:bg-panel2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!canApply}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md font-medium transition-colors",
                  canApply
                    ? "bg-amber-600/20 text-amber-500 hover:bg-amber-600/30"
                    : "text-faint cursor-not-allowed",
                )}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isPresetKey(v?: string): v is PresetKey {
  return !!v && ["today", "yesterday", "7d", "30d", "90d", "365d"].includes(v);
}

function isCompareKey(v?: string): v is CompareKey {
  return !!v && ["none", "previous_period", "previous_year"].includes(v);
}
