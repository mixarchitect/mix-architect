"use client";

import type { MonthColumn } from "@/lib/timeline-utils";

interface TimelineHeaderProps {
  months: MonthColumn[];
  todayX: number;
  totalWidth: number;
}

export function TimelineHeader({ months, todayX, totalWidth }: TimelineHeaderProps) {
  return (
    <div className="relative h-8 border-b border-white/5" style={{ width: totalWidth }}>
      {/* Month labels */}
      {months.map((m, i) => {
        const showYear = i === 0 || m.label === "Jan";
        return (
          <div
            key={`${m.year}-${m.label}`}
            className="absolute top-0 h-full flex items-end pb-1.5 pl-2 border-l border-white/10"
            style={{ left: m.startX, width: m.width }}
          >
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider select-none">
              {m.label}
              {showYear && (
                <span className="text-faint ml-1">{m.year}</span>
              )}
            </span>
          </div>
        );
      })}

      {/* Today label */}
      {todayX >= 0 && todayX <= totalWidth && (
        <div
          className="absolute top-0 h-full flex items-start pt-1 pointer-events-none"
          style={{ left: todayX }}
        >
          <span
            className="text-[10px] font-mono text-signal ml-1 select-none whitespace-nowrap"
            style={{ color: "var(--signal)" }}
          >
            Today
          </span>
        </div>
      )}
    </div>
  );
}
