import { cn } from "@/lib/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  // cn() is plain concatenation (no tailwind-merge), and Tailwind emits radius
  // utilities in alphabetical order, so a caller's `rounded-full`/`rounded-lg`
  // would lose to a hard-coded `rounded-md`. Only apply the default radius
  // when the caller doesn't bring their own.
  const hasRadius = /\brounded\b|\brounded-/.test(className ?? "");
  return (
    <div
      aria-hidden="true"
      className={cn("bg-panel2 animate-pulse", !hasRadius && "rounded-md", className)}
      {...props}
    />
  );
}
