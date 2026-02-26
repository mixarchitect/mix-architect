"use client";

import { relativeTime, absoluteDate } from "@/lib/relative-time";
import { useTimestampMode } from "@/lib/timestamp-context";

type Props = {
  date: string;
  className?: string;
};

export function Timestamp({ date, className }: Props) {
  const { mode, toggle } = useTimestampMode();
  const showAbsolute = mode === "absolute";

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={className}
      style={{ cursor: "pointer" }}
      title={showAbsolute ? relativeTime(date) : absoluteDate(date)}
    >
      {showAbsolute ? absoluteDate(date) : relativeTime(date)}
    </span>
  );
}
