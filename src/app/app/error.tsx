"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-signal-muted">
        <AlertTriangle className="w-6 h-6 text-signal" />
      </div>
      <h2 className="text-lg font-semibold text-text">Something went wrong</h2>
      <p className="text-sm text-muted max-w-md">
        We hit an unexpected error loading this page. You can try again, or head
        back to the dashboard.
      </p>
      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/app">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mt-6 p-4 bg-panel2 border border-border rounded-lg text-xs text-left text-muted max-w-lg overflow-auto">
          {error.message}
          {error.stack && `\n\n${error.stack}`}
        </pre>
      )}
    </div>
  );
}
