"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

interface GenreFilterProps {
  genres: string[];
  active?: string;
  basePath?: string;
}

export function GenreFilter({ genres, active, basePath = "/featured" }: GenreFilterProps) {
  if (genres.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      <Link
        href={basePath}
        className={cn(
          "px-3 py-1 text-xs rounded-full border transition-colors",
          !active
            ? "bg-white/10 text-white border-white/20"
            : "text-zinc-400 border-white/10 hover:text-white hover:border-white/20",
        )}
      >
        All
      </Link>
      {genres.map((genre) => (
        <Link
          key={genre}
          href={`${basePath}?genre=${encodeURIComponent(genre)}`}
          className={cn(
            "px-3 py-1 text-xs rounded-full border transition-colors",
            active === genre
              ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
              : "text-zinc-400 border-white/10 hover:text-white hover:border-white/20",
          )}
        >
          {genre}
        </Link>
      ))}
    </div>
  );
}
