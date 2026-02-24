"use client";

import { useState, useRef } from "react";
import { Pin, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/relative-time";

type Props = {
  name: string;
  notes: string;
  flagged: boolean;
  createdAt?: string;
  updatedAt?: string;
  onUpdate: (data: { name?: string; notes?: string; flagged?: boolean }) => void;
  onDelete: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  className?: string;
};

export function ElementRow({
  name, notes, flagged, createdAt, updatedAt,
  onUpdate, onDelete, onDragStart, onDragOver, onDrop,
  isDragging, isDragOver, className,
}: Props) {
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
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={(e) => e.currentTarget.classList.remove("opacity-40")}
      className={cn(
        "rounded-md border bg-panel px-4 py-3 space-y-2 transition-all",
        flagged ? "border-signal/30 bg-signal/[0.02]" : "border-border",
        isDragging && "opacity-40",
        isDragOver && "border-signal border-dashed",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <GripVertical
          size={14}
          className="text-faint cursor-grab shrink-0 active:cursor-grabbing"
        />
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
          title={flagged ? "Unpin" : "Pin to top"}
        >
          <Pin size={14} className={flagged ? "fill-current" : ""} />
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
