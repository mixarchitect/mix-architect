"use client";

import { useState, useRef } from "react";
import { Star, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  notes: string;
  flagged: boolean;
  onUpdate: (data: { name?: string; notes?: string; flagged?: boolean }) => void;
  onDelete: () => void;
  className?: string;
};

export function ElementRow({ name, notes, flagged, onUpdate, onDelete, className }: Props) {
  const [localName, setLocalName] = useState(name);
  const [localNotes, setLocalNotes] = useState(notes);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function debouncedUpdate(data: { name?: string; notes?: string }) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onUpdate(data), 500);
  }

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
        className="w-full text-sm text-text bg-transparent border-none outline-none resize-none min-h-[60px] placeholder:text-faint"
      />
    </div>
  );
}
