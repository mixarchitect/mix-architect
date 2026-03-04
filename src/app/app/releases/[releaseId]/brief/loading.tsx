export default function Loading() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto">
      {/* Loading indicator */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="flex items-center gap-2 text-muted text-sm">
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Loading...
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        <div className="h-6 w-40 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
      </div>

      {/* Release overview card */}
      <div className="rounded-lg border border-border bg-panel p-6 mb-8 space-y-4">
        <div className="h-5 w-48 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-4 w-20 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-4 w-24 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="h-4 w-16 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
        <div className="h-16 w-full rounded bg-black/[0.06] dark:bg-white/[0.08]" />
      </div>

      {/* Track sections */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-8">
          <div className="h-px bg-border mb-6" />
          <div className="h-5 w-56 rounded bg-black/[0.06] dark:bg-white/[0.08] mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="h-4 w-3/4 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            <div className="flex gap-4">
              <div className="h-4 w-28 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
              <div className="h-4 w-28 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
