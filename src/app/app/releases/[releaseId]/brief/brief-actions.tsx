"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Link as LinkIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { canEdit, type ReleaseRole } from "@/lib/permissions";

type Props = { releaseId: string; role?: ReleaseRole };

export function BriefActions({ releaseId, role }: Props) {
  const [copied, setCopied] = useState(false);

  function handlePrint() {
    window.print();
  }

  async function handleCopyLink() {
    const supabase = createSupabaseBrowserClient();

    const { data: existing } = await supabase
      .from("brief_shares")
      .select("share_token")
      .eq("release_id", releaseId)
      .maybeSingle();

    let token = existing?.share_token;

    if (!token) {
      const { data } = await supabase
        .from("brief_shares")
        .insert({ release_id: releaseId })
        .select("share_token")
        .single();
      token = data?.share_token;
    }

    if (token) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/brief/${token}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="primary" onClick={handlePrint}>
        <Download size={16} />
        Download PDF
      </Button>
      {canEdit(role ?? "owner") && (
        <Button variant="secondary" onClick={handleCopyLink}>
          <LinkIcon size={16} />
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      )}
    </div>
  );
}
