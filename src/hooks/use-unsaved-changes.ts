import { useEffect, useCallback, useRef } from "react";

/**
 * Warns users before leaving a page with unsaved changes.
 *
 * - `beforeunload` fires the browser's native "Leave site?" dialog on
 *   refresh, close tab, or browser back/forward.
 * - `guardedNavigate` wraps in-app navigation (Cancel, Back links) with
 *   a `window.confirm()` prompt.
 *
 * @param isDirty — whether the form has unsaved changes
 * @returns guardedNavigate — call with a callback that performs navigation
 */
export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  // Browser refresh / close / external navigation
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Guard for in-app navigation (Cancel, Back links, etc.)
  const guardedNavigate = useCallback(
    (navigate: () => void) => {
      if (!dirtyRef.current) {
        navigate();
        return;
      }
      if (window.confirm("You have unsaved changes. Leave without saving?")) {
        navigate();
      }
    },
    [],
  );

  return guardedNavigate;
}
