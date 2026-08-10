import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
} as const;

type SpinnerProps = {
  size?: keyof typeof SIZES;
  /** Screen-reader announcement; pass a translated string in leaf components. */
  label?: string;
  className?: string;
};

export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <span role="status" className={cn("inline-flex", className)}>
      <Loader2 aria-hidden="true" className={cn("animate-spin", SIZES[size])} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
