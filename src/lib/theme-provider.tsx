"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useFocusOnRouteChange } from "@/hooks/use-focus-on-route-change";

export function ThemeProvider({
  defaultTheme = "system",
  children,
}: {
  defaultTheme?: string;
  children: React.ReactNode;
}) {
  useFocusOnRouteChange();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("@/utils/axe-dev").then(({ initAxeDev }) => initAxeDev());
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
