import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      {/* Loading indicator */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="flex items-center gap-2 text-muted text-sm">
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Loading...
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-6 w-48 rounded" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-6 mb-8 border-b border-border pb-2">
        {[64, 48, 72, 48].map((w, i) => (
          <Skeleton key={i} className="h-4 rounded" style={{ width: w }} />
        ))}
      </div>

      {/* Content + sidebar skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
