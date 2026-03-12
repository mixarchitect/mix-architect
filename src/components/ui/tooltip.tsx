"use client";

import { useState, useRef, type ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  /** Horizontal alignment relative to the trigger */
  align?: "center" | "left" | "right";
  /** Vertical side */
  side?: "top" | "bottom";
};

export function Tooltip({ label, children, align = "center", side = "bottom" }: Props) {
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleEnter() {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setShow(true), 200);
  }

  function handleLeave() {
    clearTimeout(timeout.current);
    setShow(false);
  }

  const alignClass =
    align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  const sideClass = side === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && (
        <span
          className={`absolute ${sideClass} ${alignClass} z-50 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap pointer-events-none bg-text text-panel`}
          role="tooltip"
        >
          {label}
        </span>
      )}
    </div>
  );
}
