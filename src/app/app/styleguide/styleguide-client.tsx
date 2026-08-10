"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";

/* Reads CSS custom properties off <html> at runtime so captions can never
   drift from globals.css, and re-reads them when next-themes flips the
   data-theme attribute. */
function useCssVars(names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({});
  const key = names.join(",");

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const name of key.split(",")) {
        next[name] = style.getPropertyValue(name).trim();
      }
      setValues(next);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [key]);

  return values;
}

const SWATCHES: Array<{ label: string; varName: string; className: string; bordered?: boolean }> = [
  { label: "bg", varName: "--bg", className: "bg-bg", bordered: true },
  { label: "panel", varName: "--panel", className: "bg-panel", bordered: true },
  { label: "panel-2", varName: "--panel-2", className: "bg-panel2", bordered: true },
  { label: "text", varName: "--text", className: "bg-text" },
  { label: "muted", varName: "--muted", className: "bg-muted" },
  { label: "faint", varName: "--faint", className: "bg-faint" },
  { label: "signal", varName: "--signal", className: "bg-signal" },
  { label: "highlight", varName: "--highlight", className: "bg-highlight", bordered: true },
  { label: "charcoal", varName: "--charcoal", className: "bg-charcoal" },
  { label: "border", varName: "--border", className: "bg-border", bordered: true },
  { label: "status-blue", varName: "--status-blue", className: "bg-status-blue" },
  { label: "status-green", varName: "--status-green", className: "bg-status-green" },
  { label: "status-orange", varName: "--status-orange", className: "bg-status-orange" },
  { label: "danger", varName: "--danger", className: "bg-danger" },
  { label: "warning", varName: "--warning", className: "bg-warning" },
  { label: "success", varName: "--success", className: "bg-success" },
];

export function TokenSwatches() {
  const values = useCssVars(SWATCHES.map((s) => s.varName));
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {SWATCHES.map((s) => (
        <div key={s.varName} className="space-y-2">
          <div
            className={`h-16 rounded-md ${s.className} ${s.bordered ? "border border-border" : ""}`}
          />
          <div className="text-xs text-muted">
            <span className="font-medium text-text">{s.label}</span>
            <span className="block font-mono text-2xs text-faint break-all">
              {values[s.varName] ?? "…"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const RADII: Array<{ label: string; varName: string; className: string }> = [
  { label: "rounded-xs", varName: "--r-xs", className: "rounded-xs" },
  { label: "rounded-sm", varName: "--r-sm", className: "rounded-sm" },
  { label: "rounded-md", varName: "--r-md", className: "rounded-md" },
  { label: "rounded-lg", varName: "--r-lg", className: "rounded-lg" },
  { label: "rounded-xl", varName: "--r-xl", className: "rounded-xl" },
];

export function RadiiScale() {
  const values = useCssVars(RADII.map((r) => r.varName));
  return (
    <div className="flex flex-wrap gap-4">
      {RADII.map((r) => (
        <div key={r.varName} className="space-y-2 text-center">
          <div className={`w-24 h-16 bg-panel2 border border-border-strong ${r.className}`} />
          <div className="text-xs text-muted">
            {r.label}
            <span className="block font-mono text-2xs text-faint">
              {values[r.varName] ?? "…"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const TYPE_STEPS: Array<{ label: string; className: string }> = [
  { label: "text-2xs", className: "text-2xs" },
  { label: "text-xs", className: "text-xs" },
  { label: "text-sm", className: "text-sm" },
  { label: "text-base", className: "text-base" },
  { label: "text-lg", className: "text-lg" },
  { label: "text-2xl", className: "text-2xl" },
];

function TypeSample({ label, className }: { label: string; className: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [px, setPx] = useState("");

  useEffect(() => {
    if (ref.current) setPx(getComputedStyle(ref.current).fontSize);
  }, []);

  return (
    <div className="flex items-baseline gap-4">
      <div className="w-24 shrink-0 font-mono text-2xs text-faint">
        {label}
        {px ? ` · ${px}` : ""}
      </div>
      <div ref={ref} className={`${className} text-text`}>
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
  );
}

export function TypeScale() {
  return (
    <div className="space-y-3">
      {TYPE_STEPS.map((t) => (
        <TypeSample key={t.label} label={t.label} className={t.className} />
      ))}
    </div>
  );
}

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [destructiveOpen, setDestructiveOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open confirm dialog
      </Button>
      <Button variant="secondary" onClick={() => setDestructiveOpen(true)}>
        Open destructive dialog
      </Button>
      <ConfirmDialog
        open={open}
        title="Publish this release?"
        description="Clients on the shared portal will see the new version immediately."
        confirmLabel="Publish"
        cancelLabel="Cancel"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
      <ConfirmDialog
        open={destructiveOpen}
        destructive
        title="Delete this track?"
        description="This removes the track and its uploaded audio. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => setDestructiveOpen(false)}
        onCancel={() => setDestructiveOpen(false)}
      />
    </div>
  );
}
