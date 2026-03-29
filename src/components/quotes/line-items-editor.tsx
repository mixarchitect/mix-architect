"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, GripVertical, Import, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { Service, ServiceUnit } from "@/types/payments";

// ── Types ────────────────────────────────────────────────────────

export type LineItemDraft = {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  track_id?: string | null;
  sort_order: number;
};

type Props = {
  lineItems: LineItemDraft[];
  onChange: (items: LineItemDraft[]) => void;
  services: Service[];
  currency: string;
  locale: string;
  isReadonly: boolean;
  hasTrackFees: boolean;
  onImportTrackFees: () => void;
};

// ── Unit Labels ──────────────────────────────────────────────────

const UNIT_LABELS: Record<ServiceUnit, string> = {
  flat: "",
  hourly: "/hr",
  per_track: "/track",
  per_song: "/song",
  per_stem: "/stem",
  custom: "",
};

// ── Component ────────────────────────────────────────────────────

export function LineItemsEditor({
  lineItems,
  onChange,
  services,
  currency,
  locale,
  isReadonly,
  hasTrackFees,
  onImportTrackFees,
}: Props) {
  const t = useTranslations("quotes");

  // DnD state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Autocomplete state
  const [activeAutoIdx, setActiveAutoIdx] = useState<number | null>(null);
  const [autoResults, setAutoResults] = useState<Service[]>([]);
  const [autoFocused, setAutoFocused] = useState(-1);
  const autoRef = useRef<HTMLDivElement>(null);

  // Services picker state
  const [showServicesPicker, setShowServicesPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Refs for input elements (for tab navigation)
  const descRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const qtyRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const rateRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // ── Click-outside handlers ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (autoRef.current && !autoRef.current.contains(e.target as Node)) {
        setActiveAutoIdx(null);
        setAutoResults([]);
        setAutoFocused(-1);
      }
    }
    if (activeAutoIdx !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeAutoIdx]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowServicesPicker(false);
      }
    }
    if (showServicesPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showServicesPicker]);

  // ── Line item handlers ──
  function addLineItem() {
    onChange([
      ...lineItems,
      { description: "", quantity: 1, unit_price: 0, sort_order: lineItems.length },
    ]);
    // Focus new description after render
    requestAnimationFrame(() => {
      descRefs.current.get(lineItems.length)?.focus();
    });
  }

  function removeLineItem(idx: number) {
    onChange(
      lineItems
        .filter((_, i) => i !== idx)
        .map((li, i) => ({ ...li, sort_order: i })),
    );
  }

  function updateLineItem(
    idx: number,
    field: keyof LineItemDraft,
    value: string | number,
  ) {
    onChange(
      lineItems.map((li, i) => (i === idx ? { ...li, [field]: value } : li)),
    );
  }

  function addFromService(service: Service) {
    onChange([
      ...lineItems,
      {
        description: service.name,
        quantity: 1,
        unit_price: service.default_rate,
        sort_order: lineItems.length,
      },
    ]);
    setShowServicesPicker(false);
  }

  // ── Autocomplete ──
  const handleDescriptionChange = useCallback(
    (idx: number, value: string) => {
      updateLineItem(idx, "description", value);

      if (value.length >= 1 && services.length > 0) {
        const query = value.toLowerCase();
        const matches = services.filter((s) =>
          s.name.toLowerCase().includes(query),
        );
        if (matches.length > 0) {
          setActiveAutoIdx(idx);
          setAutoResults(matches);
          setAutoFocused(-1);
          return;
        }
      }
      setActiveAutoIdx(null);
      setAutoResults([]);
      setAutoFocused(-1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services, lineItems],
  );

  function selectAutoResult(idx: number, service: Service) {
    onChange(
      lineItems.map((li, i) =>
        i === idx
          ? {
              ...li,
              description: service.name,
              unit_price: service.default_rate,
            }
          : li,
      ),
    );
    setActiveAutoIdx(null);
    setAutoResults([]);
    setAutoFocused(-1);
    // Focus rate field after selection
    requestAnimationFrame(() => {
      qtyRefs.current.get(idx)?.focus();
    });
  }

  function handleAutoKeyDown(e: React.KeyboardEvent, idx: number) {
    if (activeAutoIdx !== idx || autoResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAutoFocused((prev) => Math.min(prev + 1, autoResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAutoFocused((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && autoFocused >= 0) {
      e.preventDefault();
      selectAutoResult(idx, autoResults[autoFocused]);
    } else if (e.key === "Escape") {
      setActiveAutoIdx(null);
      setAutoResults([]);
      setAutoFocused(-1);
    }
  }

  // ── Tab / Enter navigation ──
  function handleKeyDown(
    e: React.KeyboardEvent,
    idx: number,
    field: "description" | "quantity" | "rate",
  ) {
    // Let autocomplete handle its own keys
    if (field === "description" && activeAutoIdx === idx && autoResults.length > 0) {
      if (["ArrowDown", "ArrowUp", "Escape"].includes(e.key)) return;
      if (e.key === "Enter" && autoFocused >= 0) return;
    }

    if (e.key === "Enter" && field === "rate") {
      e.preventDefault();
      // If last row, add new line item
      if (idx === lineItems.length - 1) {
        addLineItem();
      } else {
        // Focus next row's description
        descRefs.current.get(idx + 1)?.focus();
      }
    }
  }

  // ── Drag and Drop ──
  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const reordered = [...lineItems];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(toIdx, 0, moved);
    onChange(reordered.map((li, i) => ({ ...li, sort_order: i })));
    setDragIdx(null);
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    setDragIdx(null);
    setDragOverIdx(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="label text-muted">{t("builder.lineItems")}</span>
        {hasTrackFees && !isReadonly && (
          <button
            type="button"
            onClick={onImportTrackFees}
            className="flex items-center gap-1 text-xs text-signal hover:underline"
          >
            <Import size={12} />
            {t("builder.importFees")}
          </button>
        )}
      </div>

      {/* Column headers */}
      {lineItems.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 shrink-0" /> {/* grip spacer */}
          <span className="flex-1 text-xs text-muted uppercase tracking-wide">
            {t("builder.colDescription")}
          </span>
          <span className="w-16 text-xs text-muted uppercase tracking-wide text-center">
            {t("builder.colQty")}
          </span>
          <span className="w-28 text-xs text-muted uppercase tracking-wide text-right">
            {t("builder.colRate")}
          </span>
          <span className="w-24 text-xs text-muted uppercase tracking-wide text-right">
            {t("builder.colAmount")}
          </span>
          {!isReadonly && <div className="w-8 shrink-0" />} {/* delete spacer */}
        </div>
      )}

      {/* Line items */}
      <div className="space-y-1">
        {lineItems.map((li, idx) => (
          <div
            key={li.id ?? `new-${idx}`}
            className={`group/row flex items-start gap-2 rounded-md transition-all ${
              dragIdx === idx ? "opacity-40" : ""
            } ${
              dragOverIdx === idx && dragIdx !== idx
                ? "border border-signal border-dashed"
                : "border border-transparent"
            }`}
            draggable={!isReadonly}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <GripVertical
              size={14}
              className={`text-muted mt-2.5 shrink-0 cursor-grab active:cursor-grabbing transition-opacity ${
                isReadonly
                  ? "invisible"
                  : "opacity-0 group-hover/row:opacity-100 max-sm:opacity-100"
              }`}
            />

            {/* Description with autocomplete */}
            <div className="relative flex-1" ref={activeAutoIdx === idx ? autoRef : undefined}>
              <input
                ref={(el) => {
                  if (el) descRefs.current.set(idx, el);
                }}
                type="text"
                value={li.description}
                onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                onFocus={() => {
                  // Show autocomplete on focus if there's a value
                  if (li.description.length >= 1 && services.length > 0) {
                    handleDescriptionChange(idx, li.description);
                  }
                }}
                onKeyDown={(e) => {
                  handleAutoKeyDown(e, idx);
                  handleKeyDown(e, idx, "description");
                }}
                className="input text-sm w-full"
                placeholder={t("builder.descriptionPlaceholder")}
                disabled={isReadonly}
              />

              {/* Autocomplete dropdown */}
              {activeAutoIdx === idx && autoResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg bg-panel border border-border shadow-float z-50 max-h-[200px] overflow-auto">
                  {autoResults.map((svc, i) => (
                    <button
                      key={svc.id}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                        i === autoFocused
                          ? "bg-panel2 text-text"
                          : "text-text hover:bg-panel2"
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent blur
                        selectAutoResult(idx, svc);
                      }}
                      onMouseEnter={() => setAutoFocused(i)}
                    >
                      <span>{svc.name}</span>
                      <span className="text-xs text-muted ml-2">
                        {formatCurrency(svc.default_rate, currency, locale)}
                        {UNIT_LABELS[svc.unit] && (
                          <span className="text-muted/60">
                            {UNIT_LABELS[svc.unit]}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <input
              ref={(el) => {
                if (el) qtyRefs.current.set(idx, el);
              }}
              type="number"
              value={li.quantity}
              onChange={(e) =>
                updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)
              }
              onKeyDown={(e) => handleKeyDown(e, idx, "quantity")}
              className="input text-sm w-16 text-center"
              min="0"
              step="1"
              disabled={isReadonly}
            />

            {/* Rate */}
            <input
              ref={(el) => {
                if (el) rateRefs.current.set(idx, el);
              }}
              type="number"
              value={li.unit_price || ""}
              onChange={(e) =>
                updateLineItem(
                  idx,
                  "unit_price",
                  parseFloat(e.target.value) || 0,
                )
              }
              onKeyDown={(e) => handleKeyDown(e, idx, "rate")}
              className="input text-sm w-28 text-right"
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={isReadonly}
            />

            {/* Amount */}
            <div
              className="w-24 text-sm text-right text-muted pt-2 shrink-0 font-medium"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatCurrency(li.quantity * li.unit_price, currency, locale)}
            </div>

            {/* Delete */}
            {!isReadonly && lineItems.length > 1 && (
              <button
                type="button"
                onClick={() => removeLineItem(idx)}
                className="p-1.5 text-muted hover:text-red-400 transition-colors mt-1 opacity-0 group-hover/row:opacity-100 max-sm:opacity-100 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add buttons */}
      {!isReadonly && (
        <div className="flex items-center gap-4 mt-3">
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center gap-1 text-xs text-signal hover:underline"
          >
            <Plus size={12} />
            {t("builder.addLineItem")}
          </button>

          {services.length > 0 && (
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setShowServicesPicker(!showServicesPicker)}
                className="flex items-center gap-1 text-xs text-signal hover:underline"
              >
                <Plus size={12} />
                {t("builder.addFromServices")}
                <ChevronDown size={10} />
              </button>

              {showServicesPicker && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-lg bg-panel border border-border shadow-float z-50 max-h-[280px] overflow-auto">
                  {services.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-panel2 transition-colors"
                      onClick={() => addFromService(svc)}
                    >
                      <span className="text-text">{svc.name}</span>
                      <span className="text-xs text-muted">
                        {formatCurrency(svc.default_rate, currency, locale)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
