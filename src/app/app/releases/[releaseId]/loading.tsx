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

      {/* Back link + title */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="h-7 w-56 rounded" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-sm" />
          <Skeleton className="h-9 w-9 rounded-sm" />
        </div>
      </div>

      {/* Content grid: track list + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Track list */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-panel p-4 flex items-center gap-3"
            >
              <Skeleton className="w-8 h-8 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-panel p-5">
            <Skeleton className="w-full aspect-square rounded mb-4" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
          <div className="rounded-lg border border-border bg-panel p-5 space-y-3">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-12 w-full rounded" />
          </div>
          <div className="rounded-lg border border-border bg-panel p-5 space-y-3">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
