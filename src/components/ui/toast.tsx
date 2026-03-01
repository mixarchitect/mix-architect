"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { X, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/cn";

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */

type ToastVariant = "error" | "success" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
  duration?: number;
};

type ToastContextValue = {
  toast: (
    message: string,
    options?: {
      variant?: ToastVariant;
      action?: { label: string; onClick: () => void };
      duration?: number;
    },
  ) => void;
  dismiss: (id: string) => void;
};

/* ────────────────────────────────────────────────────────────────
   Context
   ──────────────────────────────────────────────────────────────── */

const ToastCtx = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/* ────────────────────────────────────────────────────────────────
   Provider
   ──────────────────────────────────────────────────────────────── */

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (
      message: string,
      options?: {
        variant?: ToastVariant;
        action?: { label: string; onClick: () => void };
        duration?: number;
      },
    ) => {
      const id = String(++nextId);
      const variant = options?.variant ?? "error";
      const duration = options?.duration ?? (variant === "error" ? 6000 : 4000);

      setToasts((prev) => [
        ...prev,
        { id, message, variant, action: options?.action, duration },
      ]);
    },
    [],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastCtx.Provider value={value}>
      {children}

      {/* Toast container — bottom-right */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ────────────────────────────────────────────────────────────────
   Toast Item
   ──────────────────────────────────────────────────────────────── */

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (!t.duration) return;
    const timer = setTimeout(() => onDismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onDismiss]);

  const Icon =
    t.variant === "error"
      ? AlertTriangle
      : t.variant === "success"
        ? CheckCircle2
        : Info;

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-float text-sm toast-enter",
        "bg-panel border-border",
      )}
    >
      <Icon
        size={16}
        className={cn(
          "shrink-0 mt-0.5",
          t.variant === "error" && "text-signal",
          t.variant === "success" && "text-status-green",
          t.variant === "info" && "text-status-blue",
        )}
      />

      <div className="flex-1 min-w-0">
        <p className="text-text leading-snug">{t.message}</p>
        {t.action && (
          <button
            onClick={() => {
              t.action!.onClick();
              onDismiss(t.id);
            }}
            className="mt-1 text-signal hover:underline text-xs font-medium"
          >
            {t.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(t.id)}
        className="text-faint hover:text-muted transition-colors shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}
