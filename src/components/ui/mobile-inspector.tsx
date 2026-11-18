"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useAudio } from "@/lib/audio-context";
import { cn } from "@/lib/cn";

type Props = {
  title?: string;
  children: React.ReactNode;
};

/**
 * On desktop (lg+): renders children inline as an aside.
 * On mobile (<lg): hides children and shows a floating info button
 * that opens a bottom sheet with the children.
 */
export function MobileInspector({ title = "Release Info", children }: Props) {
  const [open, setOpen] = useState(false);
  const miniPlayerActive = !!useAudio().activeVersion;

  return (
    <>
      {/* Desktop: inline aside */}
      <aside className="hidden lg:block space-y-4">
        {children}
      </aside>

      {/* Mobile: floating button + bottom sheet */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Show release info"
          className={cn(
            "fixed right-4 z-30 w-12 h-12 rounded-full bg-signal text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform",
            // Sit above the mini player once audio is loaded; it would
            // otherwise cover this button completely on phones.
            miniPlayerActive ? "bottom-36" : "bottom-20",
          )}
        >
          <Info size={20} strokeWidth={1.5} />
        </button>

        <BottomSheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title={title}
        >
          <div className="space-y-4">
            {children}
          </div>
        </BottomSheet>
      </div>
    </>
  );
}
