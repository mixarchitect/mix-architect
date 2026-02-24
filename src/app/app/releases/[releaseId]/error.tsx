"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <h2 className="text-lg font-semibold text-text">Something went wrong</h2>
      <p className="text-sm text-muted max-w-md text-center">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
        style={{ background: "var(--signal)", color: "#fff" }}
      >
        Try again
      </button>
    </div>
  );
}
