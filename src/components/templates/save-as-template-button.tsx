"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      <Button
        variant="secondary"
        className="h-8 w-8 p-0"
        onClick={() => setOpen(true)}
        title="Save as template"
      >
        <LayoutTemplate size={14} />
      </Button>

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
