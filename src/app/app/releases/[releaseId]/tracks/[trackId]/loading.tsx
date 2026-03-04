export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-2 mb-8 text-muted text-sm">
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        Loading...
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-4 w-28 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-6 w-48 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
        <div className="h-9 w-28 rounded-md bg-black/[0.06] dark:bg-white/[0.08]" />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-6 mb-8 border-b border-border pb-2">
        {[64, 48, 72, 48].map((w, i) => (
          <div key={i} className="h-4 rounded bg-black/[0.06] dark:bg-white/[0.08]" style={{ width: w }} />
        ))}
      </div>

      {/* Content + sidebar skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <div className="h-40 rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-24 rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-20 rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
        <div className="space-y-4">
          <div className="h-32 rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-48 rounded-lg bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
      </div>
    </div>
  );
}
