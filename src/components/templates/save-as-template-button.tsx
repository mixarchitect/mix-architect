"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";
import { SaveAsTemplateModal } from "./save-as-template-modal";

type Props = {
  releaseId: string;
  releaseTitle: string;
};

export function SaveAsTemplateButton({ releaseId, releaseTitle }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        size="sm"
        onClick={() => setOpen(true)}
        title="Save as template"
      >
        <LayoutTemplate size={14} />
      </IconButton>

      {open && (
        <SaveAsTemplateModal
          releaseId={releaseId}
          releaseTitle={releaseTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
