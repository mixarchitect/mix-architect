"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: string;
  onSave: (value: string) => void;
  as?: "text" | "textarea";
  placeholder?: string;
  className?: string;
};

export function InlineEdit({ value, onSave, as = "text", placeholder, className }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function save() {
    onSave(draft);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div
        className={cn("group flex items-start gap-2 cursor-pointer", className)}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        <span className={cn("text-sm", value ? "text-text" : "text-muted italic")}>
          {value || placeholder || "Click to edit"}
        </span>
        <Pencil
          size={12}
          className="text-faint opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0"
        />
      </div>
    );
  }

  if (as === "textarea") {
    return (
      <div className="space-y-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancel();
            if (e.key === "Enter" && e.metaKey) save();
          }}
          className="input min-h-[80px] resize-y text-sm"
          placeholder={placeholder}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={save} className="p-1 text-status-green hover:opacity-80">
            <Check size={14} />
          </button>
          <button type="button" onClick={cancel} className="p-1 text-muted hover:text-text">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
      }}
      onBlur={save}
      className="input text-sm h-9 py-1"
      placeholder={placeholder}
    />
  );
}
