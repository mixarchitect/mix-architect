"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Link as LinkIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { canEdit, type ReleaseRole } from "@/lib/permissions";
import { useToast } from "@/components/ui/toast";

type Props = { releaseId: string; role?: ReleaseRole };

export function BriefActions({ releaseId, role }: Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  function handlePrint() {
    window.print();
  }

  async function getShareLink(): Promise<string> {
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

    if (!token) throw new Error("Could not create a share link");
    return `${window.location.origin}/portal/${token}`;
  }

  async function handleCopyLink() {
    try {
      // Safari (and so every iOS browser) only allows a clipboard write
      // started synchronously inside the tap. Handing ClipboardItem a
      // promise keeps the write inside the gesture while the token loads.
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        const link = getShareLink();
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": link.then((l) => new Blob([l], { type: "text/plain" })),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(await getShareLink());
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[brief] copy link failed:", err);
      toast("Could not copy the link. Please try again.", { variant: "error" });
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
