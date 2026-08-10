"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** modal: centered panel. sheet: bottom-anchored on small screens. */
  variant?: "modal" | "sheet";
  /** id of the element that titles this dialog */
  labelledBy?: string;
  ariaLabel?: string;
  /** default true; backdrop clicks close the dialog */
  closeOnBackdrop?: boolean;
  className?: string;
};

/**
 * Modal primitive on the native <dialog> element. showModal() provides the
 * top layer, focus trap, Escape handling, inert background, and focus
 * restoration to the opener - none of which the previous in-tree overlay
 * divs had. React state stays the source of truth: Escape is intercepted
 * and routed through onClose instead of letting the platform close the
 * element behind React's back.
 */
export function Dialog({
  open,
  onClose,
  children,
  variant = "modal",
  labelledBy,
  ariaLabel,
  closeOnBackdrop = true,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  if (!open) {
    // Unmount content when closed so heavy children don't stay in the tree.
    return null;
  }

  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        // First mount with open=true: the effect above also runs, but the
        // ref callback fires before it and covers the initial render.
        if (el && !el.open) el.showModal();
      }}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clicks on the backdrop land on the <dialog> element itself;
        // clicks inside the panel land on descendants.
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "dialog-reset bg-transparent p-0 max-w-none max-h-none",
        variant === "modal" &&
          "m-auto w-[calc(100vw-32px)] sm:w-auto sm:min-w-[380px] sm:max-w-lg",
        variant === "sheet" &&
          "mx-auto mb-0 mt-auto w-full sm:m-auto sm:w-auto sm:min-w-[380px] sm:max-w-lg",
      )}
    >
      <div
        className={cn(
          "bg-panel border border-border shadow-float overflow-hidden",
          variant === "modal" && "rounded-lg",
          variant === "sheet" && "rounded-t-lg sm:rounded-lg",
          className,
        )}
      >
        {children}
      </div>
    </dialog>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Replacement for window.confirm() on destructive actions. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} labelledBy="confirm-dialog-title">
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <h2 id="confirm-dialog-title" className="text-sm font-semibold text-text">
            {title}
          </h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "h-11 px-5 rounded-sm text-sm font-semibold transition-colors disabled:opacity-50",
              destructive
                ? "bg-danger text-white hover:opacity-90"
                : "btn-primary",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
