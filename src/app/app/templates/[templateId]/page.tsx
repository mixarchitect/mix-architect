"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { TemplateForm } from "@/components/templates/template-form";
import type { ReleaseTemplate } from "@/types/template";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const [template, setTemplate] = useState<ReleaseTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("release_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      setTemplate(data as ReleaseTemplate | null);
      setLoading(false);
    }
    load();
  }, [templateId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-sm text-muted py-12 text-center">Loading...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-sm text-muted py-12 text-center">
          Template not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/app/templates"
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to Templates
        </Link>
      </div>

      <TemplateForm initialData={template} />
    </div>
  );
}
