"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TemplateForm } from "@/components/templates/template-form";

export default function NewTemplatePage() {
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

      <TemplateForm />
    </div>
  );
}
