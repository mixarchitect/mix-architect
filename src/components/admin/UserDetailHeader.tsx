"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X, FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  userId: string;
  name: string;
  email: string | null;
  persona: string | null;
  isTestAccount: boolean;
};

const PERSONA_OPTIONS = [
  { value: "artist", label: "Artist" },
  { value: "engineer", label: "Engineer" },
  { value: "both", label: "Both" },
  { value: "other", label: "Other" },
];

export function UserDetailHeader({ userId, name, email, persona, isTestAccount }: Props) {
  return (
    <div className="space-y-3">
      <EditableField userId={userId} field="display_name" label="Name" value={name} />
      <EditableField userId={userId} field="email" label="Email" value={email ?? ""} />
      <EditablePersona userId={userId} value={persona} />
      <div className="flex items-center gap-2 text-[10px] text-faint">{userId}</div>
      <TestAccountToggle userId={userId} initial={isTestAccount} />
    </div>
  );
}

function EditableField({
  userId,
  field,
  label,
  value,
}: {
  userId: string;
  field: string;
  label: string;
  value: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, field, value: draft }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update");
      }
    } catch {
      alert("Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-faint uppercase tracking-wider w-12 shrink-0">{label}</span>
        <input
          type={field === "email" ? "email" : "text"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setEditing(false); setDraft(value); }
          }}
          autoFocus
          className="flex-1 rounded-md border border-amber-500/30 bg-panel px-2 py-1 text-sm text-text focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={save}
          disabled={saving}
          className="w-6 h-6 flex items-center justify-center rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => { setEditing(false); setDraft(value); }}
          className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-text hover:bg-panel2 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-[10px] text-faint uppercase tracking-wider w-12 shrink-0">{label}</span>
      <span className={cn("text-sm", field === "display_name" ? "font-bold text-text text-lg" : "text-muted")}>
        {value || <span className="text-faint italic">Not set</span>}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="w-5 h-5 flex items-center justify-center rounded text-faint opacity-0 group-hover:opacity-100 hover:text-text hover:bg-panel2 transition-all"
      >
        <Pencil size={10} />
      </button>
    </div>
  );
}

function EditablePersona({ userId, value }: { userId: string; value: string | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(newValue: string) {
    if (newValue === value) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, field: "persona", value: newValue }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update");
      }
    } catch {
      alert("Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-faint uppercase tracking-wider w-12 shrink-0">Type</span>
      <div className="flex gap-1">
        {PERSONA_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            disabled={saving}
            className={cn(
              "text-xs px-2 py-0.5 rounded border transition-colors",
              value === opt.value
                ? "bg-amber-600/15 text-amber-500 border-amber-500/30 font-medium"
                : "text-muted border-border hover:text-text hover:bg-panel2",
              saving && "opacity-50 pointer-events-none",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TestAccountToggle({ userId, initial }: { userId: string; initial: boolean }) {
  const router = useRouter();
  const [isTest, setIsTest] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, field: "is_test_account", value: !isTest }),
      });
      if (res.ok) {
        setIsTest(!isTest);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update");
      }
    } catch {
      alert("Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={cn(
        "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors",
        isTest
          ? "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
          : "border-border text-muted hover:text-text hover:bg-panel2",
        saving && "opacity-50 pointer-events-none",
      )}
    >
      <FlaskConical size={12} />
      {isTest ? "Test Account" : "Mark as Test"}
    </button>
  );
}
