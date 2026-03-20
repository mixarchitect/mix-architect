"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Props = {
  targetSelector: string;
  padding?: number;
  /** Render nothing when target is not found (e.g. tour-complete step) */
  optional?: boolean;
};

type Rect = { x: number; y: number; w: number; h: number };

const EMPTY: Rect = { x: -9999, y: -9999, w: 0, h: 0 };

export function TourSpotlight({ targetSelector, padding = 8, optional }: Props) {
  const [rect, setRect] = useState<Rect>(EMPTY);
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);
  const frameRef = useRef(0);

  const updateRect = useCallback(() => {
    const el = document.querySelector(targetSelector);
    if (!el) {
      if (optional) setVisible(false);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      x: r.left - padding,
      y: r.top - padding,
      w: r.width + padding * 2,
      h: r.height + padding * 2,
    });
    setVisible(true);
  }, [targetSelector, padding, optional]);

  // Scroll target into view when selector changes
  useEffect(() => {
    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout>;

    function tryScroll() {
      const el = document.querySelector(targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Small delay after scroll for accurate rect
        setTimeout(updateRect, 150);
      } else if (retries < 40) {
        retries++;
        retryTimer = setTimeout(tryScroll, 100);
      } else if (optional) {
        setVisible(false);
      }
    }

    tryScroll();
    return () => clearTimeout(retryTimer);
  }, [targetSelector, updateRect, optional]);

  // Continuous position tracking
  useEffect(() => {
    const el = document.querySelector(targetSelector);

    // ResizeObserver on target
    if (el) {
      observerRef.current = new ResizeObserver(() => {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(updateRect);
      });
      observerRef.current.observe(el);
    }

    // Scroll & resize listeners
    const handleScroll = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(updateRect);
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      observerRef.current?.disconnect();
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [targetSelector, updateRect]);

  if (!visible) return null;

  const r = 10; // border-radius for cutout

  return (
    <svg
      className="fixed inset-0 z-[9998] w-full h-full"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        <mask id="tour-spotlight-mask">
          {/* White = visible overlay (dimmed area) */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Black = cutout (transparent area) */}
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.w}
            height={rect.h}
            rx={r}
            ry={r}
            fill="black"
            style={{ transition: "x 200ms ease-out, y 200ms ease-out, width 200ms ease-out, height 200ms ease-out" }}
          />
        </mask>
      </defs>

      {/* Dimmed background with cutout */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="black"
        opacity="0.45"
        mask="url(#tour-spotlight-mask)"
      />

      {/* Highlighted border around cutout */}
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.w}
        height={rect.h}
        rx={r}
        ry={r}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="2"
        className="animate-pulse"
        style={{
          transition: "x 200ms ease-out, y 200ms ease-out, width 200ms ease-out, height 200ms ease-out",
          opacity: 0.7,
        }}
      />
    </svg>
  );
}
