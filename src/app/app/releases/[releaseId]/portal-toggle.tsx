"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Globe, ExternalLink } from "lucide-react";

type PortalToggleProps = {
  releaseId: string;
  initialActive: boolean;
  initialShareId: string | null;
  initialShareToken: string | null;
};

export function PortalToggle({
  releaseId,
  initialActive,
  initialShareId,
  initialShareToken,
}: PortalToggleProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [shareId, setShareId] = useState(initialShareId);
  const [shareToken, setShareToken] = useState(initialShareToken);
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
          .select("id, share_token")
          .single();
        if (data) {
          setShareId(data.id);
          setShareToken(data.share_token);
          setActive(true);
        }
      }
      router.refresh();
    } finally {
      setToggling(false);
    }
  }

  const portalUrl =
    active && shareToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${shareToken}`
      : null;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className="btn-secondary !px-3 !gap-1.5"
        title={active ? "Portal is active" : "Portal is off"}
      >
        <Globe size={16} />
        <span
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            active ? "bg-signal" : "bg-black/20 dark:bg-white/20"
          }`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
              active ? "translate-x-[13px]" : "translate-x-[2px]"
            }`}
          />
        </span>
      </button>
      {portalUrl && (
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary !px-3"
          title="Open portal"
        >
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}
