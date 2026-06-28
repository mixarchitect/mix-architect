import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";
import { getEntitlements } from "@/lib/entitlements";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/**
 * POST /api/workspace/email-domain
 *  { action: "add", domain }  → register the domain in Resend, store DNS records
 *  { action: "verify" }        → ask Resend to verify, refresh status
 * Studio-gated + owner-only. The customer adds the returned DNS records to their
 * domain, then verifies.
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = rateLimit(`ws-email-domain:${ip}`, 10, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const action = String(body.action ?? "add");

  const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ws } = await supabase
    .from("workspaces")
    .select("id, plan")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!ws) return NextResponse.json({ error: "No workspace found." }, { status: 404 });
  if (!getEntitlements(ws.plan).brandedEmail) {
    return NextResponse.json(
      { error: "Branded email is a Studio feature. Upgrade to use your own domain." },
      { status: 403 },
    );
  }

  const service = createSupabaseServiceClient();

  if (action === "add") {
    const domain = String(body.domain ?? "").trim().toLowerCase();
    if (!DOMAIN_RE.test(domain)) {
      return NextResponse.json({ error: "Enter a valid domain, e.g. yourstudio.com." }, { status: 400 });
    }
    try {
      const created = await resend.domains.create({ name: domain });
      const d = created.data;
      if (!d) throw new Error(created.error?.message || "Resend rejected the domain.");
      await service.from("workspace_email_domains").upsert(
        {
          workspace_id: ws.id,
          domain,
          resend_domain_id: d.id,
          status: d.status ?? "pending",
          dns_records: d.records ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id" },
      );
      return NextResponse.json({ domain, status: d.status ?? "pending", records: d.records ?? [] });
    } catch (err) {
      console.error("[workspace/email-domain] add failed:", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to add domain." },
        { status: 500 },
      );
    }
  }

  if (action === "verify") {
    const { data: row } = await service
      .from("workspace_email_domains")
      .select("resend_domain_id")
      .eq("workspace_id", ws.id)
      .maybeSingle();
    if (!row?.resend_domain_id) {
      return NextResponse.json({ error: "Add a domain first." }, { status: 404 });
    }
    try {
      await resend.domains.verify(row.resend_domain_id);
      const got = await resend.domains.get(row.resend_domain_id);
      const status = got.data?.status ?? "pending";
      await service
        .from("workspace_email_domains")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("workspace_id", ws.id);
      return NextResponse.json({ status });
    } catch (err) {
      console.error("[workspace/email-domain] verify failed:", err);
      return NextResponse.json({ error: "Verification check failed. Try again shortly." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
