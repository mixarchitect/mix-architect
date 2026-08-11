"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/ui/tooltip";
import { displayVersion, useChangelogStatus } from "@/hooks/use-changelog-status";

const WhatsNewDialog = dynamic(
  () => import("@/components/ui/whats-new-dialog").then((m) => m.WhatsNewDialog),
  { ssr: false },
);

export function WhatsNewButton() {
  const t = useTranslations("help");
  const { entries, versionTag, hasUnread, markSeen } = useChangelogStatus();
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  const label = versionTag ? displayVersion(versionTag) : t("whatsNew");

  return (
    <>
      <Tooltip label={t("whatsNew")} align="right">
        <button
          type="button"
          onClick={() => {
            markSeen();
            setOpen(true);
          }}
          aria-label={hasUnread ? t("whatsNewUnreadAria") : t("whatsNewOpenAria")}
          className="relative h-9 px-2 rounded-lg flex items-center text-muted hover:text-text hover:bg-panel2 transition-colors"
        >
          <span className="font-mono text-2xs">{label}</span>
          {hasUnread && (
            <span aria-hidden className="absolute top-1.5 right-0.5 w-1.5 h-1.5 rounded-full bg-signal" />
          )}
        </button>
      </Tooltip>
      {open && <WhatsNewDialog entries={entries} onClose={() => setOpen(false)} />}
    </>
  );
}
