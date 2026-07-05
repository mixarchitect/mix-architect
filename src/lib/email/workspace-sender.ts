import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { getEntitlements, normalizePlan } from "@/lib/entitlements";
import { DEFAULT_BRAND, type EmailBrand } from "@/lib/email-templates/branded-layout";

const SHARED_FROM_ADDRESS = "team@mixarchitect.com";
export const DEFAULT_FROM = `Mix Architect <${SHARED_FROM_ADDRESS}>`;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Format a display name for an email `from`/reply header. Strips characters
 * that would break the header and quotes the name when it contains RFC 5322
 * specials (comma, @, parens, etc.).
 */
function formatSenderName(raw: string): string {
  const clean = raw
    .replace(/[\r\n"\\<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  return /[,;:@()[\].]/.test(clean) ? `"${clean}"` : clean;
}

/**
 * The `from` header for a workspace's outbound client email. Studio workspaces
 * send under their own studio name from the shared, already-verified
 * mixarchitect.com address ("Studio Name <team@mixarchitect.com>"); Free/Pro
 * (and unknown workspaces) get the Mix Architect default. The studio name comes
 * from `getWorkspaceEmailBrand`, which is Studio-gated. Server-only.
 */
export async function getWorkspaceSenderFrom(
  workspaceId: string | null | undefined,
): Promise<string> {
  const brand = await getWorkspaceEmailBrand(workspaceId);
  if (brand === DEFAULT_BRAND) return DEFAULT_FROM; // non-Studio → unchanged
  const name = formatSenderName(brand.name);
  return name ? `${name} <${SHARED_FROM_ADDRESS}>` : DEFAULT_FROM;
}

/**
 * The `reply-to` for a workspace's outbound client email, so client replies
 * reach the studio (not team@mixarchitect.com). Studio only: the configured
 * `workspace_branding.reply_to_email`, else the workspace owner's account
 * email. Returns undefined for Free/Pro (no reply-to). Server-only.
 */
export async function getWorkspaceReplyTo(
  workspaceId: string | null | undefined,
): Promise<string | undefined> {
  if (!workspaceId) return undefined;

  const service = createSupabaseServiceClient();
  const { data: ws } = await service
    .from("workspaces")
    .select("owner_user_id, plan")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws || !getEntitlements(normalizePlan(ws.plan)).brandedEmail) return undefined;

  const { data: branding } = await service
    .from("workspace_branding")
    .select("reply_to_email")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const configured = branding?.reply_to_email?.trim();
  if (configured && EMAIL_RE.test(configured)) return configured;

  if (ws.owner_user_id) {
    const { data: owner } = await service.auth.admin.getUserById(ws.owner_user_id);
    const email = owner?.user?.email;
    if (email && EMAIL_RE.test(email)) return email;
  }

  return undefined;
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
