"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Panel, PanelBody } from "@/components/ui/panel";
import { createExpense, updateExpense, deleteExpense } from "@/app/app/releases/[releaseId]/expense-actions";
import type { ReleaseExpense } from "@/app/app/releases/[releaseId]/expense-actions";

function fmt(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

interface Props {
  releaseId: string;
  expenses: ReleaseExpense[];
  currency: string;
  locale: string;
}

export function ExpensePanel({ releaseId, expenses: initialExpenses, currency, locale }: Props) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Add form state
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPaidBy, setNewPaidBy] = useState("");
  const [newOwedBy, setNewOwedBy] = useState("");

  // Edit form state
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editPaidBy, setEditPaidBy] = useState("");
  const [editOwedBy, setEditOwedBy] = useState("");

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  function resetAddForm() {
    setNewDesc("");
    setNewAmount("");
    setNewPaidBy("");
    setNewOwedBy("");
    setIsAdding(false);
  }

  function startEdit(e: ReleaseExpense) {
    setEditingId(e.id);
    setEditDesc(e.description);
    setEditAmount(String(e.amount));
    setEditPaidBy(e.paid_by ?? "");
    setEditOwedBy(e.owed_by ?? "");
  }

  function handleAdd() {
    const amount = parseFloat(newAmount);
    if (!newDesc.trim() || isNaN(amount) || amount <= 0) return;

    startTransition(async () => {
      const result = await createExpense({
        releaseId,
        description: newDesc.trim(),
        amount,
        paidBy: newPaidBy || undefined,
        owedBy: newOwedBy || undefined,
      });
      if (!result.error) {
        // Optimistically add to list
        setExpenses((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            release_id: releaseId,
            user_id: "",
            description: newDesc.trim(),
            amount,
            paid_by: newPaidBy.trim() || null,
            owed_by: newOwedBy.trim() || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        resetAddForm();
        router.refresh();
      }
    });
  }

  function handleUpdate() {
    if (!editingId) return;
    const amount = parseFloat(editAmount);
    if (!editDesc.trim() || isNaN(amount) || amount <= 0) return;

    startTransition(async () => {
      const result = await updateExpense({
        id: editingId,
        releaseId,
        description: editDesc.trim(),
        amount,
        paidBy: editPaidBy.trim() || null,
        owedBy: editOwedBy.trim() || null,
      });
      if (!result.error) {
        setExpenses((prev) =>
          prev.map((e) =>
            e.id === editingId
              ? { ...e, description: editDesc.trim(), amount, paid_by: editPaidBy.trim() || null, owed_by: editOwedBy.trim() || null }
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
      const result = await deleteExpense(id, releaseId);
      if (!result.error) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        router.refresh();
      }
    });
  }

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label-sm text-muted">EXPENSES</div>
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

        {expenses.length === 0 && !isAdding && (
          <p className="text-sm text-muted">No expenses tracked</p>
        )}

        {/* Expense rows */}
        {expenses.length > 0 && (
          <div className="space-y-1.5">
            {expenses.map((expense) =>
              editingId === expense.id ? (
                <div key={expense.id} className="rounded-lg border border-border p-3 space-y-2">
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="input text-xs h-7 w-full"
                    placeholder="Description"
                    autoFocus
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="input text-xs h-7"
                      placeholder="Amount"
                    />
                    <input
                      type="text"
                      value={editPaidBy}
                      onChange={(e) => setEditPaidBy(e.target.value)}
                      className="input text-xs h-7"
                      placeholder="Paid by"
                    />
                    <input
                      type="text"
                      value={editOwedBy}
                      onChange={(e) => setEditOwedBy(e.target.value)}
                      className="input text-xs h-7"
                      placeholder="Owed by"
                    />
                  </div>
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
                  key={expense.id}
                  className="group relative flex items-center justify-between rounded-lg px-2 py-2.5 -mx-2 hover:bg-panel2 transition-colors"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-text truncate block">{expense.description}</span>
                    {(expense.paid_by || expense.owed_by) && (
                      <div className="text-xs text-faint mt-0.5">
                        {expense.paid_by && <span>Paid by {expense.paid_by}</span>}
                        {expense.paid_by && expense.owed_by && <span> · </span>}
                        {expense.owed_by && <span>Owed by {expense.owed_by}</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-text font-medium shrink-0 ml-4">
                    {fmt(Number(expense.amount), currency, locale)}
                  </span>
                  {/* Edit/delete overlay */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-panel2 rounded pl-2">
                    <button
                      type="button"
                      onClick={() => startEdit(expense)}
                      className="text-muted hover:text-text transition-colors p-0.5"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(expense.id)}
                      className="text-muted hover:text-red-400 transition-colors p-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ),
            )}

            {/* Total row */}
            <div className="flex justify-between text-sm pt-2 border-t border-border mt-2">
              <span className="text-muted">Total</span>
              <span className="text-text font-medium">{fmt(total, currency, locale)}</span>
            </div>
          </div>
        )}

        {/* Add form */}
        {isAdding && (
          <div className="rounded-lg border border-border p-3 space-y-2 mt-2">
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="input text-xs h-7 w-full"
              placeholder="Description *"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") resetAddForm();
              }}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="input text-xs h-7"
                placeholder="Amount *"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") resetAddForm();
                }}
              />
              <input
                type="text"
                value={newPaidBy}
                onChange={(e) => setNewPaidBy(e.target.value)}
                className="input text-xs h-7"
                placeholder="Paid by"
                onKeyDown={(e) => {
                  if (e.key === "Escape") resetAddForm();
                }}
              />
              <input
                type="text"
                value={newOwedBy}
                onChange={(e) => setNewOwedBy(e.target.value)}
                className="input text-xs h-7"
                placeholder="Owed by"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") resetAddForm();
                }}
              />
            </div>
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
                disabled={isPending || !newDesc.trim() || !newAmount}
                className="text-xs text-signal hover:text-teal-300 transition-colors px-2 py-1 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
