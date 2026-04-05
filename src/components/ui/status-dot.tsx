import { cn } from "@/lib/cn";

type StatusColor = "blue" | "green" | "orange";

type StatusDotProps = {
  color: StatusColor;
  withShape?: boolean;
  className?: string;
};

export function StatusDot({ color, withShape, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "status-dot",
        color === "blue" && "status-dot-blue",
        color === "green" && "status-dot-green",
        color === "orange" && "status-dot-orange",
        withShape && "status-dot-shaped",
        className
      )}
      aria-hidden="true"
    >
      {withShape && color === "green" && (
        <svg viewBox="0 0 8 8" className="status-dot-icon">
          <path d="M1.5 4 L3.2 5.8 L6.5 2.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {withShape && color === "orange" && (
        <svg viewBox="0 0 8 8" className="status-dot-icon">
          <path d="M4 4 L4 1.5 A2.5 2.5 0 0 1 4 6.5 Z" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

type StatusIndicatorProps = {
  color: StatusColor;
  label: string;
  withShape?: boolean;
  className?: string;
};

export function StatusIndicator({ color, label, withShape, className }: StatusIndicatorProps) {
  return (
    <span className={cn("status-indicator", className)}>
      <StatusDot color={color} withShape={withShape} />
      <span>{label}</span>
    </span>
  );
}
