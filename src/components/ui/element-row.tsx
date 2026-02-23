"use client";

import { useState, useRef } from "react";
import { Star, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  notes: string;
  flagged: boolean;
  createdAt?: string;
  updatedAt?: string;
  onUpdate: (data: { name?: string; notes?: string; flagged?: boolean }) => void;
  onDelete: () => void;
  className?: string;
};

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ElementRow({ name, notes, flagged, createdAt, updatedAt, onUpdate, onDelete, className }: Props) {
  const [localName, setLocalName] = useState(name);
  const [localNotes, setLocalNotes] = useState(notes);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function debouncedUpdate(data: { name?: string; notes?: string }) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onUpdate(data), 500);
  }

  const hasTimestamp = createdAt || updatedAt;
  const wasEdited = updatedAt && createdAt && updatedAt !== createdAt;

  return (
    <div
      className={cn(
        "rounded-md border bg-panel px-4 py-3 space-y-2",
        flagged ? "border-signal/30" : "border-border",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-faint cursor-grab shrink-0" />
        <input
          type="text"
          value={localName}
          onChange={(e) => {
            setLocalName(e.target.value);
            debouncedUpdate({ name: e.target.value });
          }}
          className="flex-1 text-sm font-semibold text-text bg-transparent border-none outline-none"
        />
        <button
          type="button"
          onClick={() => onUpdate({ flagged: !flagged })}
          className={cn(
            "p-1 rounded transition-colors",
            flagged ? "text-signal" : "text-faint hover:text-signal"
          )}
          title={flagged ? "Remove flag" : "Flag for attention"}
        >
          <Star size={14} fill={flagged ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded text-faint hover:text-signal transition-colors"
          title="Remove element"
        >
          <X size={14} />
        </button>
      </div>
      <textarea
        value={localNotes}
        onChange={(e) => {
          setLocalNotes(e.target.value);
          debouncedUpdate({ notes: e.target.value });
        }}
        placeholder="Mix notes for this element..."
        className="w-full text-sm text-text bg-transparent border-none outline-none resize-none min-h-[40px] placeholder:text-faint"
      />
      {hasTimestamp && (
        <div className="flex items-center gap-3 text-[10px] text-faint font-mono pt-1 border-t border-border/50">
          {createdAt && <span>Added {relativeTime(createdAt)}</span>}
          {wasEdited && <span>&middot; Updated {relativeTime(updatedAt)}</span>}
        </div>
      )}
    </div>
  );
}
