"use client";

import { useState, useRef, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

type EditableTitleProps = {
  /** Current title text */
  value: string;
  /** Supabase table to update */
  table: string;
  /** Row ID to update */
  id: string;
  /** Column name to update (default: "title") */
  column?: string;
  /** Extra classNames for the display text */
  className?: string;
  /** Content rendered before the title (e.g. track number) */
  prefix?: React.ReactNode;
};

export function EditableTitle({
  value,
  table,
  id,
  column = "title",
  className = "",
  prefix,
}: EditableTitleProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setDraft(value);
      setEditing(false);
      return;
    }

    setSaving(true);
    await supabase.from(table).update({ [column]: trimmed }).eq("id", id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-2">
        {prefix}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className={`bg-transparent border-b-2 border-signal outline-none ${className}`}
        />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-2 group cursor-pointer"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {prefix}
      <span className={className}>{value}</span>
      <Pencil
        size={14}
        className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      />
    </span>
  );
}
