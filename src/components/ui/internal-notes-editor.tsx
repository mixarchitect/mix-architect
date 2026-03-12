"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Lock } from "lucide-react";
import { Panel, PanelBody } from "@/components/ui/panel";

type Props = {
  label: string;
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
};

export function InternalNotesEditor({ label, initialValue, onSave, placeholder }: Props) {
  const [value, setValue] = useState(initialValue);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);
  const latestValueRef = useRef(value);

  latestValueRef.current = value;

  const save = useCallback(
    async (text: string) => {
      setSaveState("saving");
      try {
        await onSave(text);
        dirtyRef.current = false;
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    },
    [onSave],
  );

  function handleChange(text: string) {
    setValue(text);
    dirtyRef.current = true;
    setSaveState("idle");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(text), 1000);
  }

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dirtyRef.current) {
        save(latestValueRef.current);
      }
    };
  }, [save]);

  return (
    <Panel className="border-amber-500/30">
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-1">
          <div className="label-sm text-muted flex items-center gap-1.5">
            <Lock size={11} className="text-amber-500" />
            {label}
          </div>
          <span className="text-[10px] text-muted">
            {saveState === "saving" && "Saving..."}
            {saveState === "saved" && "Saved"}
            {saveState === "error" && "Error"}
          </span>
        </div>
        <p className="text-[10px] text-amber-500/70 mb-2">Only visible to you</p>
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="input min-h-[60px] resize-y text-sm w-full"
          placeholder={placeholder ?? "Add private notes..."}
        />
      </PanelBody>
    </Panel>
  );
}
