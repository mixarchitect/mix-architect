"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type TimestampMode = "relative" | "absolute";

type TimestampContextValue = {
  mode: TimestampMode;
  toggle: () => void;
};

const TimestampCtx = createContext<TimestampContextValue | null>(null);

export function TimestampProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TimestampMode>("relative");
  const toggle = useCallback(() => setMode((m) => (m === "relative" ? "absolute" : "relative")), []);

  return <TimestampCtx.Provider value={{ mode, toggle }}>{children}</TimestampCtx.Provider>;
}

export function useTimestampMode(): TimestampContextValue {
  const ctx = useContext(TimestampCtx);
  if (!ctx) throw new Error("useTimestampMode must be used within TimestampProvider");
  return ctx;
}
