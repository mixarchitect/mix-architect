import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

export const DEFAULT_FROM = "Mix Architect <team@mixarchitect.com>";

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
