"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import {
  type FeatureKey,
  type FeatureVisibility,
  resolveVisibility,
  getDefaultVisibility,
} from "./feature-registry";

type FeatureVisibilityState = {
  visibility: FeatureVisibility;
  persona: string | null;
  isFeatureVisible: (key: FeatureKey) => boolean;
  updateFeatureVisibility: (key: FeatureKey, visible: boolean) => void;
  setPersonaDefaults: (persona: "artist" | "engineer" | "both" | "other") => void;
  setBulkVisibility: (visibility: FeatureVisibility) => void;
};

const ALL_VISIBLE = resolveVisibility(null);

const FeatureVisibilityContext = createContext<FeatureVisibilityState>({
  visibility: ALL_VISIBLE,
  persona: null,
  isFeatureVisible: () => true,
  updateFeatureVisibility: () => {},
  setPersonaDefaults: () => {},
  setBulkVisibility: () => {},
});

export function FeatureVisibilityProvider({
  initial,
  persona: initialPersona,
  children,
}: {
  initial: Partial<FeatureVisibility> | null;
  persona: string | null;
  children: React.ReactNode;
}) {
  const [visibility, setVisibility] = useState(() => resolveVisibility(initial));
  const [persona, setPersona] = useState(initialPersona);

  // Keep in sync with server prop
  useEffect(() => {
    setVisibility(resolveVisibility(initial));
  }, [initial]);

  useEffect(() => {
    setPersona(initialPersona);
  }, [initialPersona]);

  const persist = useCallback((updated: FeatureVisibility, updatedPersona?: string) => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) return;
      const payload: Record<string, unknown> = { feature_visibility: updated };
      if (updatedPersona !== undefined) payload.persona = updatedPersona;
      supabase
        .from("user_defaults")
        .update(payload)
        .eq("user_id", user.id)
        .then(() => {});
    });
  }, []);

  const isFeatureVisible = useCallback(
    (key: FeatureKey) => visibility[key] ?? true,
    [visibility],
  );

  const updateFeatureVisibility = useCallback(
    (key: FeatureKey, visible: boolean) => {
      const updated = { ...visibility, [key]: visible };
      setVisibility(updated);
      persist(updated);
    },
    [visibility, persist],
  );

  const setPersonaDefaults = useCallback(
    (p: "artist" | "engineer" | "both" | "other") => {
      const defaults = getDefaultVisibility(p);
      setVisibility(defaults);
      setPersona(p);
      persist(defaults, p);
    },
    [persist],
  );

  const setBulkVisibility = useCallback(
    (v: FeatureVisibility) => {
      setVisibility(v);
      persist(v);
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      visibility,
      persona,
      isFeatureVisible,
      updateFeatureVisibility,
      setPersonaDefaults,
      setBulkVisibility,
    }),
    [visibility, persona, isFeatureVisible, updateFeatureVisibility, setPersonaDefaults, setBulkVisibility],
  );

  return (
    <FeatureVisibilityContext.Provider value={value}>
      {children}
    </FeatureVisibilityContext.Provider>
  );
}

export function useFeatureVisibility() {
  return useContext(FeatureVisibilityContext);
}
