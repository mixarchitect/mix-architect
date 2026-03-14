export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-32 rounded bg-panel2" />
        <div className="h-8 w-36 rounded bg-panel2" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3 rounded-lg border border-border bg-panel">
            <div className="h-3 w-24 rounded bg-panel2 mb-3" />
            <div className="h-6 w-16 rounded bg-panel2 mb-2" />
            <div className="h-3 w-20 rounded bg-panel2" />
          </div>
        ))}
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="h-4 w-32 rounded bg-panel2 mb-2" />
          <div className="h-3 w-48 rounded bg-panel2 mb-4" />
          <div className="h-[200px] rounded bg-panel2" />
        </div>
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="h-4 w-32 rounded bg-panel2 mb-2" />
          <div className="h-3 w-48 rounded bg-panel2 mb-4" />
          <div className="h-[200px] rounded bg-panel2" />
        </div>
        <div className="lg:col-span-2 bg-panel border border-border rounded-lg p-4">
          <div className="h-4 w-24 rounded bg-panel2 mb-2" />
          <div className="h-3 w-48 rounded bg-panel2 mb-4" />
          <div className="h-[200px] rounded bg-panel2" />
        </div>
      </div>
    </div>
  );
}
