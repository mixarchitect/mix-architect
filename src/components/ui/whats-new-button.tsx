"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { displayVersion, useChangelogStatus } from "@/hooks/use-changelog-status";

const WhatsNewDialog = dynamic(
  () => import("@/components/ui/whats-new-dialog").then((m) => m.WhatsNewDialog),
  { ssr: false },
);

/**
 * Rail footer item: megaphone icon with an unread dot, version label
 * revealed alongside it exactly like the NavItem labels (hover-expand
 * on mid-size screens, permanent from xl up).
 */
export function WhatsNewButton() {
  const t = useTranslations("help");
  const { entries, versionTag, hasUnread, markSeen } = useChangelogStatus();
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  const label = versionTag ? displayVersion(versionTag) : t("whatsNew");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          markSeen();
          setOpen(true);
        }}
        aria-label={hasUnread ? t("whatsNewUnreadAria") : t("whatsNewOpenAria")}
        className="flex items-center gap-3 w-full px-2 h-10 rounded-md text-muted transition-all duration-150 hover:text-text hover:bg-panel2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted"
      >
        <span className="relative w-6 h-10 grid place-items-center shrink-0">
          <Megaphone size={20} strokeWidth={1.5} />
          {hasUnread && (
            <span aria-hidden className="absolute top-2 right-0 w-1.5 h-1.5 rounded-full bg-signal" />
          )}
        </span>
        <span className="font-mono text-2xs whitespace-nowrap opacity-0 group-hover/rail:opacity-100 xl:opacity-100 transition-opacity duration-150 delay-75">
          {label}
        </span>
      </button>
      {open && <WhatsNewDialog entries={entries} onClose={() => setOpen(false)} />}
    </>
  );
}
