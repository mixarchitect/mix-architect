"use client";

import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  songTitle: string;
  artist?: string | null;
  note?: string | null;
  url?: string | null;
  onDelete?: () => void;
  className?: string;
};

export function ReferenceCard({ songTitle, artist, note, url, onDelete, className }: Props) {
  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-md border border-border bg-panel", className)}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text">{songTitle}</div>
        {artist && <div className="text-xs text-muted">{artist}</div>}
        {note && <div className="text-xs text-muted mt-1 italic">&ldquo;{note}&rdquo;</div>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-muted hover:text-text transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-faint hover:text-signal transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
