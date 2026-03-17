"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X, Timer, PenLine } from "lucide-react";
import { Panel, PanelBody } from "@/components/ui/panel";
import { createTimeEntry, updateTimeEntry, deleteTimeEntry } from "@/app/app/releases/[releaseId]/time-entry-actions";
import type { ReleaseTimeEntry } from "@/app/app/releases/[releaseId]/time-entry-actions";

function fmt(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  releaseId: string;
  timeEntries: ReleaseTimeEntry[];
  currency: string;
  locale: string;
  defaultRate: number | null;
}

export function TimeEntryList({ releaseId, timeEntries: initialEntries, currency, locale, defaultRate }: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Add form
  const [newHours, setNewHours] = useState("");
  const [newBillable, setNewBillable] = useState(true);
  const [newRate, setNewRate] = useState(defaultRate != null ? String(defaultRate) : "");
  const [newDesc, setNewDesc] = useState("");

  // Edit form
  const [editHours, setEditHours] = useState("");
  const [editBillable, setEditBillable] = useState(true);
  const [editRate, setEditRate] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
  const totalBillable = entries.reduce((sum, e) => {
    if (e.rate != null) return sum + Number(e.hours) * Number(e.rate);
    return sum;
  }, 0);

  function resetAddForm() {
    setNewHours("");
    setNewBillable(true);
    setNewRate(defaultRate != null ? String(defaultRate) : "");
    setNewDesc("");
    setIsAdding(false);
  }

  function startEdit(e: ReleaseTimeEntry) {
    setEditingId(e.id);
    setEditHours(String(e.hours));
    setEditBillable(e.rate != null);
    setEditRate(e.rate != null ? String(e.rate) : (defaultRate != null ? String(defaultRate) : ""));
    setEditDesc(e.description ?? "");
  }

  function handleAdd() {
    const hours = parseFloat(newHours);
    if (isNaN(hours) || hours <= 0) return;
    const rate = newBillable && newRate.trim() ? parseFloat(newRate) : null;

    startTransition(async () => {
      const result = await createTimeEntry({
        releaseId,
        hours,
        rate,
        description: newDesc || undefined,
        entryType: "manual",
      });
      if (!result.error) {
        setEntries((prev) => [
          {
            id: crypto.randomUUID(),
            release_id: releaseId,
            user_id: "",
            hours,
            rate,
            description: newDesc.trim() || null,
            entry_type: "manual",
            started_at: null,
            ended_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        resetAddForm();
        router.refresh();
      }
    });
  }

  function handleUpdate() {
    if (!editingId) return;
    const hours = parseFloat(editHours);
    if (isNaN(hours) || hours <= 0) return;
    const rate = editBillable && editRate.trim() ? parseFloat(editRate) : null;

    startTransition(async () => {
      const result = await updateTimeEntry({
        id: editingId,
        releaseId,
        hours,
        rate,
        description: editDesc.trim() || null,
      });
      if (!result.error) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === editingId
              ? { ...e, hours, rate, description: editDesc.trim() || null }
              : e,
          ),
        );
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTimeEntry(id, releaseId);
      if (!result.error) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        router.refresh();
      }
    });
  }

  // Allow parent (timer) to add entries via refresh
  // This is handled by server revalidation + key prop

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label-sm text-muted">TIME LOG</div>
          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 text-xs text-signal hover:text-teal-300 transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          )}
        </div>

        {entries.length === 0 && !isAdding && (
          <p className="text-sm text-muted">No time logged</p>
        )}

        {/* Add form */}
        {isAdding && (
          <div className="rounded-lg border border-border p-3 space-y-2 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-faint uppercase">Hours *</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  className="input text-xs h-7 w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") resetAddForm();
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-faint uppercase">Rate/hr</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newBillable ? newRate : ""}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="input text-xs h-7 w-full"
                  placeholder="—"
                  disabled={!newBillable}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") resetAddForm();
                  }}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newBillable}
                onChange={(e) => setNewBillable(e.target.checked)}
                className="accent-signal"
              />
              <span className="text-xs text-muted">Billable</span>
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="input text-xs h-7 w-full"
              placeholder="What did you work on?"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") resetAddForm();
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetAddForm}
                className="text-xs text-muted hover:text-text transition-colors px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={isPending || !newHours || parseFloat(newHours) <= 0}
                className="text-xs text-signal hover:text-teal-300 transition-colors px-2 py-1 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Entry rows */}
        {entries.length > 0 && (
          <div className="space-y-1.5">
            {entries.map((entry) =>
              editingId === entry.id ? (
                <div key={entry.id} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-faint uppercase">Hours</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        value={editHours}
                        onChange={(e) => setEditHours(e.target.value)}
                        className="input text-xs h-7 w-full"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-faint uppercase">Rate/hr</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editBillable ? editRate : ""}
                        onChange={(e) => setEditRate(e.target.value)}
                        className="input text-xs h-7 w-full"
                        placeholder="—"
                        disabled={!editBillable}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editBillable}
                      onChange={(e) => setEditBillable(e.target.checked)}
                      className="accent-signal"
                    />
                    <span className="text-xs text-muted">Billable</span>
                  </label>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="input text-xs h-7 w-full"
                    placeholder="Description"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={isPending}
                      className="text-signal hover:opacity-80 transition-opacity"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-muted hover:text-text transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={entry.id}
                  className="group flex items-start justify-between gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-panel2 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm">
                      {entry.entry_type === "timer" ? (
                        <Timer size={12} className="text-faint shrink-0" />
                      ) : (
                        <PenLine size={12} className="text-faint shrink-0" />
                      )}
                      <span className="text-text">
                        {Number(entry.hours).toFixed(2)} hrs
                      </span>
                      {entry.rate != null && (
                        <>
                          <span className="text-faint">×</span>
                          <span className="text-faint">
                            {fmt(Number(entry.rate), currency, locale)}/hr
                          </span>
                          <span className="text-faint">=</span>
                          <span className="text-xs text-text font-medium">
                            {fmt(Number(entry.hours) * Number(entry.rate), currency, locale)}
                          </span>
                        </>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-xs text-faint mt-0.5 ml-5 truncate">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-faint">
                      {formatShortDate(entry.created_at)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="text-muted hover:text-text transition-colors p-0.5"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="text-muted hover:text-red-400 transition-colors p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}

            {/* Total row */}
            <div className="flex justify-between text-sm pt-2 border-t border-border mt-2">
              <span className="text-muted">
                Total: {totalHours.toFixed(2)} hrs
              </span>
              {totalBillable > 0 && (
                <span className="text-text font-medium">
                  {fmt(totalBillable, currency, locale)}
                </span>
              )}
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
