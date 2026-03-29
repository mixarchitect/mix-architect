"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Button } from "@/components/ui/button";
import {
  createService,
  createServicesBulk,
  updateService,
  deleteService,
  reorderServices,
} from "@/actions/services";
import type { Service, ServiceUnit } from "@/types/payments";
import { formatCurrency } from "@/lib/currency";

const UNIT_OPTIONS: { value: ServiceUnit; labelKey: string }[] = [
  { value: "flat", labelKey: "flat" },
  { value: "hourly", labelKey: "hourly" },
  { value: "per_track", labelKey: "perTrack" },
  { value: "per_song", labelKey: "perSong" },
  { value: "per_stem", labelKey: "perStem" },
  { value: "custom", labelKey: "custom" },
];

const SUGGESTED_SERVICES: {
  name: string;
  default_rate: number;
  unit: ServiceUnit;
}[] = [
  { name: "Full Mix", default_rate: 400, unit: "per_song" },
  { name: "Vocal Tuning", default_rate: 50, unit: "per_song" },
  { name: "Mastering", default_rate: 100, unit: "per_song" },
  { name: "Stem Delivery", default_rate: 150, unit: "flat" },
  { name: "Additional Revision", default_rate: 75, unit: "flat" },
  { name: "Studio Time", default_rate: 60, unit: "hourly" },
];

type Props = {
  currency: string;
  locale: string;
};

export function ServicesCatalog({ currency, locale }: Props) {
  const t = useTranslations("settings");
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSuggested, setAddingSuggested] = useState(false);

  // DnD state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Debounced update refs per service
  const updateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("sort_order");

      setServices((data ?? []) as Service[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      updateTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  function scheduleUpdate(service: Service) {
    const existing = updateTimers.current.get(service.id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      updateTimers.current.delete(service.id);
      await updateService(service.id, {
        name: service.name,
        description: service.description,
        default_rate: service.default_rate,
        unit: service.unit,
      });
    }, 800);

    updateTimers.current.set(service.id, timer);
  }

  function handleFieldChange(
    id: string,
    field: keyof Service,
    value: string | number,
  ) {
    setServices((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      );
      const svc = updated.find((s) => s.id === id);
      if (svc) scheduleUpdate(svc);
      return updated;
    });
  }

  async function handleAddService() {
    const result = await createService({
      name: "",
      default_rate: 0,
      unit: "flat",
    });
    if (result.service) {
      setServices((prev) => [...prev, result.service!]);
    }
  }

  async function handleDeleteService(id: string) {
    // Cancel any pending update
    const timer = updateTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      updateTimers.current.delete(id);
    }
    await deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleAddSuggested() {
    setAddingSuggested(true);
    const result = await createServicesBulk(SUGGESTED_SERVICES);
    if (result.services.length > 0) {
      setServices((prev) => [...prev, ...result.services]);
    }
    setAddingSuggested(false);
  }

  // ── Drag and Drop ──
  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  async function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const reordered = [...services];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setServices(reordered);
    setDragIdx(null);
    setDragOverIdx(null);
    await reorderServices(reordered.map((s) => s.id));
  }

  function handleDragEnd() {
    setDragIdx(null);
    setDragOverIdx(null);
  }

  const unitLabel = (unit: ServiceUnit) => {
    const opt = UNIT_OPTIONS.find((o) => o.value === unit);
    return opt ? t(`services.units.${opt.labelKey}`) : unit;
  };

  if (loading) return null;

  return (
    <Panel>
      <PanelHeader>
        <h2 className="text-base font-semibold text-text">
          {t("services.title")}
        </h2>
        <p className="text-sm text-muted mt-1">{t("services.description")}</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-5">
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted mb-4">
              {t("services.noServices")}
            </p>
            <Button
              variant="secondary"
              onClick={handleAddSuggested}
              disabled={addingSuggested}
            >
              <Sparkles size={14} />
              {addingSuggested
                ? t("services.addingSuggested")
                : t("services.addSuggested")}
            </Button>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-5 shrink-0" />
              <span className="flex-1 text-xs text-muted uppercase tracking-wide">
                {t("services.name")}
              </span>
              <span className="w-28 text-xs text-muted uppercase tracking-wide text-right">
                {t("services.rate")}
              </span>
              <span className="w-32 text-xs text-muted uppercase tracking-wide">
                {t("services.unit")}
              </span>
              <div className="w-8 shrink-0" />
            </div>

            <div className="space-y-1">
              {services.map((svc, idx) => (
                <div
                  key={svc.id}
                  className={`group flex items-center gap-2 rounded-md px-1 py-1.5 transition-all ${
                    dragIdx === idx ? "opacity-40" : ""
                  } ${
                    dragOverIdx === idx && dragIdx !== idx
                      ? "border border-signal border-dashed"
                      : "border border-transparent"
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                >
                  <GripVertical
                    size={14}
                    className="text-muted shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <input
                    type="text"
                    value={svc.name}
                    onChange={(e) =>
                      handleFieldChange(svc.id, "name", e.target.value)
                    }
                    className="input text-sm flex-1"
                    placeholder={t("services.namePlaceholder")}
                  />
                  <input
                    type="number"
                    value={svc.default_rate || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        svc.id,
                        "default_rate",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="input text-sm w-28 text-right"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <select
                    value={svc.unit}
                    onChange={(e) =>
                      handleFieldChange(
                        svc.id,
                        "unit",
                        e.target.value as ServiceUnit,
                      )
                    }
                    className="input text-sm w-32"
                  >
                    {UNIT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(`services.units.${opt.labelKey}`)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(svc.id)}
                    className="p-1 text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {services.length > 0 && (
          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center gap-1 text-xs text-signal hover:underline mt-3"
          >
            <Plus size={12} />
            {t("services.addService")}
          </button>
        )}
      </PanelBody>
    </Panel>
  );
}
