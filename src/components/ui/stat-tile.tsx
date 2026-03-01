import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  variant?: "default" | "accent";
  className?: string;
};

export function StatTile({
  label,
  value,
  unit,
  note,
  variant = "default",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "px-5 py-4 transition-all duration-150 ease-out",
        variant === "default" && "stat-tile",
        variant === "accent" && "panel-accent relative overflow-hidden",
        className
      )}
    >
      <div className="relative z-10">
        <div
          className={cn(
            "label text-[11px]",
            variant === "default" ? "text-faint" : "text-white/70"
          )}
        >
          {label}
        </div>
        <div
          className={cn(
            "mt-2 text-2xl leading-tight tracking-tight font-semibold",
            variant === "default" ? "text-text" : "text-white"
          )}
        >
          {value}
          {unit && (
            <span className="text-[0.5em] ml-1 opacity-60">{unit}</span>
          )}
        </div>
        {note && (
          <div
            className={cn(
              "mt-1 text-xs",
              variant === "default" ? "text-muted" : "text-white/70"
            )}
          >
            {note}
          </div>
        )}
      </div>
    </div>
  );
}
