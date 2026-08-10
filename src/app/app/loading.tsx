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

      {/* Page title skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-10 w-36 rounded-sm" />
      </div>

      {/* KPI stats skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-panel p-5">
            <Skeleton className="h-3 w-16 rounded mb-2" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Release cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-panel p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
            <Skeleton className="h-3 w-full rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
