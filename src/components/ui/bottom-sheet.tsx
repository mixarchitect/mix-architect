"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: string;
};

export function BottomSheet({ isOpen, onClose, title, children, height = "85vh" }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientY);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStart === null) return;
    const delta = e.touches[0].clientY - touchStart;
    if (delta > 0) setTouchDelta(delta);
  }

  function handleTouchEnd() {
    if (touchDelta > 100) {
      onClose();
    }
    setTouchStart(null);
    setTouchDelta(0);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Panel"}
        className={cn(
          "fixed left-0 right-0 bottom-0 z-50 bg-panel border-t border-border rounded-t-2xl flex flex-col",
          "animate-[slide-up_200ms_ease-out]",
        )}
        style={{
          height,
          transform: touchDelta > 0 ? `translateY(${touchDelta}px)` : undefined,
          transition: touchDelta > 0 ? "none" : "transform 200ms ease-out",
          background: "var(--panel)",
        }}
      >
        {/* Drag handle + header */}
        <div
          className="shrink-0 pt-2 pb-3 px-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-3" />
          {title && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text">{title}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-text transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
}
