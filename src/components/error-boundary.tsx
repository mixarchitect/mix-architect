"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import Link from "next/link";

/* ────────────────────────────────────────────────────────────────
   Error Boundary
   ──────────────────────────────────────────────────────────────── */

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "page" | "section" | "inline";
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const level = this.props.level ?? "section";

    if (level === "page") {
      return <PageErrorFallback onRetry={this.reset} />;
    }
    if (level === "inline") {
      return <InlineErrorFallback onRetry={this.reset} />;
    }
    return <SectionErrorFallback onRetry={this.reset} />;
  }
}

/* ────────────────────────────────────────────────────────────────
   Page-Level Fallback
   ──────────────────────────────────────────────────────────────── */

function PageErrorFallback({ onRetry }: { onRetry?: () => void }) {
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
        {onRetry && (
          <Button variant="ghost" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Link href="/app">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Section-Level Fallback  (exported for use as standalone)
   ──────────────────────────────────────────────────────────────── */

export function SectionErrorFallback({
  title,
  onRetry,
}: {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <Panel className="flex items-center gap-3 px-5 py-4">
      <AlertTriangle className="w-4 h-4 text-signal shrink-0" />
      <span className="text-sm text-muted">
        Failed to load{title ? ` ${title.toLowerCase()}` : ""}.
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-signal hover:underline ml-auto"
        >
          Retry
        </button>
      )}
    </Panel>
  );
}

/* ────────────────────────────────────────────────────────────────
   Inline Fallback
   ──────────────────────────────────────────────────────────────── */

function InlineErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted py-2">
      <AlertTriangle className="w-3.5 h-3.5 text-signal shrink-0" />
      <span>Failed to load</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-signal hover:underline text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
}
