"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export type SavedContact = {
  id: string;
  person_name: string;
  pro_org?: string | null;
  member_account?: string | null;
  ipi?: string | null;
  sound_exchange_id?: string | null;
  label_name?: string | null;
};

export function useSavedContacts() {
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const userIdRef = useRef<string | null>(null);

  // Load contacts + cache user_id on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      userIdRef.current = user.id;

      const { data } = await supabase
        .from("saved_contacts")
        .select("id, person_name, pro_org, member_account, ipi, sound_exchange_id, label_name")
        .order("person_name");

      if (!cancelled && data) setContacts(data);
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  const saveContact = useCallback(
    async (contact: { person_name: string; pro_org?: string; member_account?: string; ipi?: string; sound_exchange_id?: string; label_name?: string }) => {
      const userId = userIdRef.current;
      if (!userId) return;

      const { data, error } = await supabase
        .from("saved_contacts")
        .upsert(
          { user_id: userId, ...contact },
          { onConflict: "user_id,person_name" },
        )
        .select("id, person_name, pro_org, member_account, ipi, sound_exchange_id, label_name")
        .single();

      if (error || !data) return;

      // Update local list
      setContacts((prev) => {
        const idx = prev.findIndex((c) => c.id === data.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [...prev, data].sort((a, b) =>
          a.person_name.localeCompare(b.person_name),
        );
      });
    },
    [supabase],
  );

  return { contacts, saveContact };
}
