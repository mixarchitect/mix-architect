"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { FeaturedRelease } from "@/types/featured-release";
import { FeaturedReleaseCard } from "@/components/featured/FeaturedReleaseCard";

interface Props {
  release: FeaturedRelease;
}

export function FeaturedReleaseBanner({ release }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
          From the Community
        </h2>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-zinc-600 hover:text-zinc-400 transition-colors"
          aria-label="Dismiss featured release"
        >
          <X size={14} />
        </button>
      </div>
      <FeaturedReleaseCard release={release} variant="spotlight" />
    </div>
  );
}
