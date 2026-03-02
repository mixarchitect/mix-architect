"use client";

import { cn } from "@/lib/cn";
import { LayoutGrid, GanttChart } from "lucide-react";

type DashboardView = "grid" | "timeline";

interface ViewToggleProps {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div
      className="hidden md:inline-flex items-center gap-0.5 p-0.5 rounded-lg"
      style={{ background: "var(--panel-2)" }}
    >
      <ToggleButton
        active={view === "grid"}
        onClick={() => onViewChange("grid")}
        label="Grid view"
      >
        <LayoutGrid size={15} strokeWidth={1.5} />
      </ToggleButton>
      <ToggleButton
        active={view === "timeline"}
        onClick={() => onViewChange("timeline")}
        label="Timeline view"
      >
        <GanttChart size={15} strokeWidth={1.5} />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-150",
        active
          ? "text-signal-on"
          : "text-muted hover:text-text",
      )}
      style={active ? { background: "var(--signal)" } : undefined}
    >
      {children}
    </button>
  );
}
