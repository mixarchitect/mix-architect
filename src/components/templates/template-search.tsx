"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TemplateCard } from "@/components/templates/template-card";
import type { ReleaseTemplate } from "@/types/template";

type Props = {
  templates: ReleaseTemplate[];
};

export function TemplateSearch({ templates }: Props) {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();
  const filtered = q
    ? templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q),
      )
    : templates;

  return (
    <div>
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates..."
          className="input pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          No templates match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}
