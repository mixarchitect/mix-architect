import { cn } from "@/lib/cn";

type StatusColor = "blue" | "green" | "orange";

type StatusDotProps = {
  color: StatusColor;
  className?: string;
};

export function StatusDot({ color, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "status-dot",
        color === "blue" && "status-dot-blue",
        color === "green" && "status-dot-green",
        color === "orange" && "status-dot-orange",
        className
      )}
    />
  );
}

type StatusIndicatorProps = {
  color: StatusColor;
  label: string;
  className?: string;
};

export function StatusIndicator({ color, label, className }: StatusIndicatorProps) {
  return (
    <span className={cn("status-indicator", className)}>
      <StatusDot color={color} />
      <span>{label}</span>
    </span>
  );
}
