"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useFocusOnRouteChange() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) {
      main.focus({ preventScroll: false });
    }
  }, [pathname]);
}
