"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  /** Visually hide the label while keeping it for screen readers. */
  labelHidden?: boolean;
  hint?: string;
  error?: string | null;
  children: (props: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
  className?: string;
};

/**
 * Label + control + error wiring in one place. The child render-prop
 * receives the id/aria props to spread onto the actual input, so the
 * control keeps its own styling (.input) while every field gets a real
 * programmatic label - most forms previously used placeholder-as-label,
 * which screen readers don't reliably announce.
 *
 *   <Field label="Email" error={emailError}>
 *     {(a11y) => <input {...a11y} type="email" className="input" ... />}
 *   </Field>
 */
export function Field({
  label,
  labelHidden = false,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className={cn("label text-muted block", labelHidden && "sr-only")}
      >
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
