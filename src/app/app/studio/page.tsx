import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { PortalBrandingCard } from "@/components/settings/portal-branding-card";
import { WorkspaceMembersCard } from "@/components/settings/workspace-members-card";
import { WorkspaceEmailCard } from "@/components/settings/workspace-email-card";
import { WorkspaceCustomDomainCard } from "@/components/settings/workspace-custom-domain-card";

/**
 * Dedicated home for the Studio tier's workspace features. The cards are the
 * same components rendered on the Settings page (kept there on purpose so
 * users find them either way); each card self-gates on the subscription plan
 * and shows an upgrade prompt on Free/Pro.
 */
export default async function StudioPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const t = await getTranslations("studio");

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold h2 text-text">{t("title")}</h1>
        <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
      </div>

      <div className="space-y-6">
        <WorkspaceMembersCard />
        <PortalBrandingCard />
        <WorkspaceEmailCard />
        <WorkspaceCustomDomainCard />
      </div>
    </div>
  );
}
