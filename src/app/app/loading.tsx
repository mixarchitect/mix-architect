export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-2 mb-8 text-muted text-sm">
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        Loading...
      </div>

      {/* Page title skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-48 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        <div className="h-10 w-36 rounded-sm bg-black/[0.06] dark:bg-white/[0.08]" />
      </div>

      {/* KPI stats skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-panel p-5">
            <div className="h-3 w-16 rounded bg-black/[0.06] dark:bg-white/[0.08] mb-2" />
            <div className="h-6 w-24 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
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
              <div className="w-10 h-10 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                <div className="h-3 w-20 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="flex gap-2">
              <div className="h-5 w-14 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
              <div className="h-5 w-14 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
