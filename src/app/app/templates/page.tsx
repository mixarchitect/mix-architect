import Link from "next/link";
import { Plus, LayoutTemplate } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateSearch } from "@/components/templates/template-search";
import type { ReleaseTemplate } from "@/types/template";

export default async function TemplatesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let templates: ReleaseTemplate[] = [];

  if (user) {
    const { data } = await supabase
      .from("release_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("usage_count", { ascending: false })
      .order("updated_at", { ascending: false });
    templates = (data ?? []) as ReleaseTemplate[];
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold h2 text-text">Templates</h1>
        <Link href="/app/templates/new">
          <Button variant="primary">
            <Plus size={16} className="mr-1.5" />
            New Template
          </Button>
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg" style={{ background: "var(--panel)" }}>
          <EmptyState
            icon={LayoutTemplate}
            size="lg"
            title="No templates yet"
            description="Templates save your go-to release settings — specs, delivery formats, client info — so you can start new projects in seconds."
            action={{
              label: "Create your first template",
              href: "/app/templates/new",
              variant: "primary",
            }}
          />
        </div>
      ) : (
        <>
          {templates.length >= 5 && <TemplateSearch templates={templates} />}
          {templates.length < 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
