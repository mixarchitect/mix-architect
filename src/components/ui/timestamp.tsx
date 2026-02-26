"use client";

import { useState } from "react";
import { relativeTime, absoluteDate } from "@/lib/relative-time";

type Props = {
  date: string;
  className?: string;
};

export function Timestamp({ date, className }: Props) {
  const [showAbsolute, setShowAbsolute] = useState(false);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setShowAbsolute((v) => !v);
      }}
      className={className}
      style={{ cursor: "pointer" }}
      title={showAbsolute ? relativeTime(date) : absoluteDate(date)}
    >
      {showAbsolute ? absoluteDate(date) : relativeTime(date)}
    </span>
  );
}
