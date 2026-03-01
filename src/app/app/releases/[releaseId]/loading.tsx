export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Back link + title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded bg-panel2" />
        <div className="h-7 w-56 rounded bg-panel2" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-16 rounded-full bg-panel2" />
          <div className="h-5 w-16 rounded-full bg-panel2" />
          <div className="h-5 w-20 rounded-full bg-panel2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-sm bg-panel2" />
          <div className="h-9 w-9 rounded-sm bg-panel2" />
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
              <div className="w-8 h-8 rounded bg-panel2" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 rounded bg-panel2" />
                <div className="h-3 w-24 rounded bg-panel2" />
              </div>
              <div className="h-5 w-16 rounded-full bg-panel2" />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-panel p-5">
            <div className="w-full aspect-square rounded bg-panel2 mb-4" />
            <div className="h-3 w-20 rounded bg-panel2" />
          </div>
          <div className="rounded-lg border border-border bg-panel p-5 space-y-3">
            <div className="h-3 w-24 rounded bg-panel2" />
            <div className="h-12 w-full rounded bg-panel2" />
          </div>
          <div className="rounded-lg border border-border bg-panel p-5 space-y-3">
            <div className="h-3 w-20 rounded bg-panel2" />
            <div className="h-8 w-full rounded bg-panel2" />
          </div>
        </div>
      </div>
    </div>
  );
}
