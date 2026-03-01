export default function Loading() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded bg-panel2" />
        <div className="h-6 w-40 rounded bg-panel2" />
      </div>

      {/* Release overview card */}
      <div className="rounded-lg border border-border bg-panel p-6 mb-8 space-y-4">
        <div className="h-5 w-48 rounded bg-panel2" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-4 w-20 rounded bg-panel2" />
          <div className="h-4 w-24 rounded bg-panel2" />
          <div className="h-4 w-16 rounded bg-panel2" />
        </div>
        <div className="h-16 w-full rounded bg-panel2" />
      </div>

      {/* Track sections */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-8">
          <div className="h-px bg-border mb-6" />
          <div className="h-5 w-56 rounded bg-panel2 mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-panel2" />
            <div className="h-4 w-3/4 rounded bg-panel2" />
            <div className="flex gap-4">
              <div className="h-4 w-28 rounded bg-panel2" />
              <div className="h-4 w-28 rounded bg-panel2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
