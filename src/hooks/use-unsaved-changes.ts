import { useEffect, useCallback, useRef } from "react";

/**
 * Warns users before leaving a page with unsaved changes.
 *
 * - `beforeunload` — native browser dialog on refresh / close / external nav
 * - Link-click interception — captures clicks on `<a>` tags (sidebar, etc.)
 *   in the capture phase, before Next.js processes them
 * - `guardedNavigate` — wraps programmatic navigation (Cancel, Back buttons)
 *
 * @param isDirty — whether the form has unsaved changes
 * @returns guardedNavigate — call with a callback that performs navigation
 */
export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  useEffect(() => {
    if (!isDirty) return;

    // Browser refresh / close / external navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // Intercept clicks on internal links (sidebar, nav, etc.)
    // Uses capture phase so it fires before React/Next.js event handlers
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      // Only intercept internal links (Next.js <Link> components)
      if (!href.startsWith("/")) return;
      // Skip if navigating to the current page
      if (href === window.location.pathname) return;
      // Skip target="_blank" links
      if (link.getAttribute("target") === "_blank") return;

      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  // Guard for programmatic navigation (Cancel, Back buttons with router.push)
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
