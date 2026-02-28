"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Globe } from "lucide-react";

type PortalToggleProps = {
  releaseId: string;
  initialActive: boolean;
  initialShareId: string | null;
};

export function PortalToggle({
  releaseId,
  initialActive,
  initialShareId,
}: PortalToggleProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [shareId, setShareId] = useState(initialShareId);
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    if (toggling) return;
    setToggling(true);

    try {
      if (active && shareId) {
        // Turn OFF
        await supabase
          .from("brief_shares")
          .update({ active: false })
          .eq("id", shareId);
        setActive(false);
      } else if (shareId) {
        // Turn ON (share exists but inactive)
        await supabase
          .from("brief_shares")
          .update({ active: true })
          .eq("id", shareId);
        setActive(true);
      } else {
        // First activation — create share
        const { data } = await supabase
          .from("brief_shares")
          .insert({ release_id: releaseId, active: true })
          .select("id")
          .single();
        if (data) {
          setShareId(data.id);
          setActive(true);
        }
      }
      router.refresh();
    } finally {
      setToggling(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={toggling}
      className={`inline-flex items-center gap-2 h-11 px-4 rounded-sm text-sm font-semibold transition-all duration-150 ease-out select-none ${
        active
          ? "bg-signal text-text-inverse"
          : "btn-secondary"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={active ? "Portal is active" : "Portal is off"}
    >
      <Globe size={16} />
      Portal
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          active ? "bg-white/25" : "bg-black/20 dark:bg-white/20"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
            active ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </span>
    </button>
  );
}
