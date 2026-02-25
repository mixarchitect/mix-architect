"use client";

import { useState, useRef } from "react";
import { Pin, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  readOnly?: boolean;
  className?: string;
};

export function ElementRow({
  name, notes, flagged, createdAt, updatedAt,
  onUpdate, onDelete, onDragStart, onDragOver, onDrop,
  onMoveUp, onMoveDown, isFirst, isLast,
  isDragging, isDragOver, readOnly, className,
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
      draggable={!readOnly}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={(e) => e.currentTarget.classList.remove("opacity-40")}
      className={cn(
        "rounded-md border bg-panel px-5 py-4 space-y-2 transition-all",
        flagged ? "border-signal/30 bg-signal/[0.02]" : "border-border",
        isDragging && "opacity-40",
        isDragOver && "border-signal border-dashed",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {!readOnly && (
          <>
            {/* Desktop: drag handle */}
            <GripVertical
              size={14}
              className="hidden md:block text-faint cursor-grab shrink-0 active:cursor-grabbing"
            />
            {/* Mobile: up/down arrows */}
            {onMoveUp && onMoveDown && (
              <div className="flex flex-col md:hidden shrink-0 -my-1">
                <button
                  type="button"
                  onClick={onMoveUp}
                  disabled={isFirst}
                  className={cn(
                    "p-0.5 rounded transition-colors",
                    isFirst ? "text-transparent" : "text-faint active:text-text",
                  )}
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={onMoveDown}
                  disabled={isLast}
                  className={cn(
                    "p-0.5 rounded transition-colors",
                    isLast ? "text-transparent" : "text-faint active:text-text",
                  )}
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </>
        )}
        <input
          type="text"
          value={localName}
          onChange={(e) => {
            if (readOnly) return;
            setLocalName(e.target.value);
            debouncedUpdate({ name: e.target.value });
          }}
          readOnly={readOnly}
          className="flex-1 text-sm font-semibold text-text bg-transparent border-none outline-none"
        />
        {!readOnly && (
          <>
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
          </>
        )}
        {readOnly && flagged && (
          <Pin size={14} className="text-signal fill-current" />
        )}
      </div>
      <textarea
        value={localNotes}
        onChange={(e) => {
          if (readOnly) return;
          setLocalNotes(e.target.value);
          debouncedUpdate({ notes: e.target.value });
        }}
        readOnly={readOnly}
        placeholder={readOnly ? "" : "Mix notes for this element..."}
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
