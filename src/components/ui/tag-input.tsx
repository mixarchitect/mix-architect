"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: string[];
  onChange?: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function TagInput({ value, onChange, suggestions = [], placeholder, disabled, className }: Props) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    if (disabled || !onChange) return;
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    if (disabled || !onChange) return;
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  const unused = suggestions.filter((s) => !value.includes(s));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[44px] items-center input">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-panel2 border border-border-strong text-xs font-medium text-text"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-muted hover:text-text transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm text-text placeholder:text-faint p-1"
          />
        )}
        {disabled && value.length === 0 && (
          <span className="text-sm text-muted italic p-1">None set</span>
        )}
      </div>
      {!disabled && unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unused.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="chip text-xs"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
