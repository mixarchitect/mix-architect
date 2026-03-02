"use client";

import type { MonthColumn } from "@/lib/timeline-utils";

interface TimelineHeaderProps {
  months: MonthColumn[];
  todayX: number;
  totalWidth: number;
}

export function TimelineHeader({ months, todayX, totalWidth }: TimelineHeaderProps) {
  return (
    <div className="relative border-b border-white/5" style={{ width: totalWidth }}>
      {/* Today label — sits in a small row above the month labels */}
      <div className="relative h-4">
        {todayX >= 0 && todayX <= totalWidth && (
          <span
            className="absolute text-[10px] font-medium select-none whitespace-nowrap pointer-events-none"
            style={{
              left: todayX + 4,
              top: 2,
              color: "var(--signal)",
            }}
          >
            Today
          </span>
        )}
      </div>

      {/* Month labels row */}
      <div className="relative h-6">
        {months.map((m, i) => {
          const showYear = i === 0 || m.label === "Jan";
          return (
            <div
              key={`${m.year}-${m.label}`}
              className="absolute top-0 h-full flex items-end pb-1 pl-2 border-l border-white/10"
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
      </div>
    </div>
  );
}
