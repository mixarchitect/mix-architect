import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Loading indicator */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="flex items-center gap-2 text-muted text-sm">
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Loading...
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="h-6 w-40 rounded" />
      </div>

      {/* Release overview card */}
      <div className="rounded-lg border border-border bg-panel p-6 mb-8 space-y-4">
        <Skeleton className="h-5 w-48 rounded" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <Skeleton className="h-16 w-full rounded" />
      </div>

      {/* Track sections */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-8">
          <div className="h-px bg-border mb-6" />
          <Skeleton className="h-5 w-56 rounded mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
