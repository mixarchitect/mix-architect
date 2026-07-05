import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { getEntitlements, normalizePlan } from "@/lib/entitlements";
import { DEFAULT_BRAND, type EmailBrand } from "@/lib/email-templates/branded-layout";

export const DEFAULT_FROM = "Mix Architect <team@mixarchitect.com>";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * The `from` header for a workspace's outbound email. If the workspace has a
 * verified custom domain (Studio, A4), returns "<Workspace> <noreply@domain>";
 * otherwise the Mix Architect default. Server-only — reads via the service
 * client (bypasses RLS), so callers must already be authorized.
 */
export async function getWorkspaceSenderFrom(
  workspaceId: string | null | undefined,
): Promise<string> {
  if (!workspaceId) return DEFAULT_FROM;

  const service = createSupabaseServiceClient();
  const { data } = await service
    .from("workspace_email_domains")
    .select("domain, status, sender_local")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!data || data.status !== "verified" || !data.domain) return DEFAULT_FROM;

  const { data: ws } = await service
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .maybeSingle();

  const name = (ws?.name ?? "").trim() || "Mix Architect";
  const local = (data.sender_local || "noreply").replace(/[^a-z0-9._-]/gi, "") || "noreply";
  return `${name} <${local}@${data.domain}>`;
}

/**
 * The brand (logo/name/accent/footer) for a workspace's outbound email bodies.
 * Studio white-label only: returns the workspace's own brand when the plan
 * grants full white-label (removePoweredBy); otherwise the Mix Architect
 * default, so Free/Pro emails render unchanged. Server-only (service client).
 */
export async function getWorkspaceEmailBrand(
  workspaceId: string | null | undefined,
): Promise<EmailBrand> {
  if (!workspaceId) return DEFAULT_BRAND;

  const service = createSupabaseServiceClient();
  const { data: ws } = await service
    .from("workspaces")
    .select("name, plan")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws || !getEntitlements(normalizePlan(ws.plan)).removePoweredBy) {
    return DEFAULT_BRAND;
  }

  const { data: branding } = await service
    .from("workspace_branding")
    .select("logo_path, accent_color")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const accent =
    branding?.accent_color && HEX_RE.test(branding.accent_color)
      ? branding.accent_color
      : DEFAULT_BRAND.accent;
  const logoUrl = branding?.logo_path
    ? service.storage.from("workspace-logos").getPublicUrl(branding.logo_path).data.publicUrl
    : null;
  const name = (ws.name ?? "").trim() || DEFAULT_BRAND.name;

  return { name, logoUrl, accent, showPoweredBy: false };
}
