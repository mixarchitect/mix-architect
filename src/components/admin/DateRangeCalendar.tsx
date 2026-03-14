"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getCalendarGrid,
  isSameDay,
  isInRange,
  addMonths,
  startOfDay,
} from "@/lib/admin-date-utils";
import { cn } from "@/lib/cn";

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DateRangeCalendarProps {
  from: Date | null;
  to: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
  maxDate?: Date;
}

export function DateRangeCalendar({
  from,
  to,
  onChange,
  maxDate,
}: DateRangeCalendarProps) {
  const today = startOfDay(new Date());
  const max = maxDate ? startOfDay(maxDate) : today;

  const [viewMonth, setViewMonth] = useState(() => {
    const base = from ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const prevMonth = useCallback(
    () => setViewMonth((v) => addMonths(v, -1)),
    [],
  );
  const nextMonth = useCallback(
    () => setViewMonth((v) => addMonths(v, 1)),
    [],
  );

  const handleDayClick = useCallback(
    (date: Date) => {
      if (!from || (from && to)) {
        onChange(date, null);
      } else {
        if (date.getTime() < from.getTime()) {
          onChange(date, null);
        } else {
          onChange(from, date);
        }
      }
    },
    [from, to, onChange],
  );

  const rangeFrom = from;
  const rangeTo = to ?? (from && !to ? hoverDate : null);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const grid = getCalendarGrid(year, month);

  // Always render exactly 6 rows to prevent layout shifts
  while (grid.length < 6) {
    grid.push([null, null, null, null, null, null, null]);
  }

  return (
    <div className="w-[252px]">
      {/* Month header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={prevMonth}
          className="p-1 text-muted hover:text-text rounded transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-text">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 text-muted hover:text-text rounded transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] text-faint font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells - always 6 rows */}
      {grid.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((date, di) => {
            if (!date) {
              return <div key={di} className="h-8" />;
            }

            const isDisabled = startOfDay(date).getTime() > max.getTime();
            const isToday = isSameDay(date, today);
            const isStart = rangeFrom ? isSameDay(date, rangeFrom) : false;
            const isEnd = rangeTo ? isSameDay(date, rangeTo) : false;
            const inRange =
              rangeFrom && rangeTo ? isInRange(date, rangeFrom, rangeTo) : false;
            const isSelected = isStart || isEnd;

            return (
              <button
                key={di}
                disabled={isDisabled}
                onClick={() => handleDayClick(date)}
                onMouseEnter={() => onHover(date)}
                onMouseLeave={() => onHover(null)}
                className={cn(
                  "h-8 w-full text-xs transition-colors relative",
                  isDisabled && "text-faint cursor-not-allowed",
                  !isDisabled &&
                    !isSelected &&
                    !inRange &&
                    "text-text hover:bg-panel2",
                  inRange && !isSelected && "bg-amber-600/8 text-text",
                  isSelected && "bg-amber-600/20 text-amber-500 font-medium",
                  isToday && !isSelected && "font-semibold",
                )}
              >
                {date.getDate()}
                {isToday && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500/50" />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  function onHover(date: Date | null) {
    setHoverDate(date);
  }
}
