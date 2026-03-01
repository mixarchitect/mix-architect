export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Page title skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-48 rounded bg-panel2" />
        <div className="h-10 w-36 rounded-sm bg-panel2" />
      </div>

      {/* KPI stats skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-panel p-5">
            <div className="h-3 w-16 rounded bg-panel2 mb-2" />
            <div className="h-6 w-24 rounded bg-panel2" />
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
              <div className="w-10 h-10 rounded bg-panel2" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 rounded bg-panel2" />
                <div className="h-3 w-20 rounded bg-panel2" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-panel2" />
            <div className="flex gap-2">
              <div className="h-5 w-14 rounded-full bg-panel2" />
              <div className="h-5 w-14 rounded-full bg-panel2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
