import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";
import { getEntitlements } from "@/lib/entitlements";

// The production Vercel project that serves mixarchitect.com. Token must be set
// in env; project/team default to the known prod values.
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT = process.env.VERCEL_PROJECT_ID || "prj_2xMVpZmbBOVoJ0id4g89cgXFQQkg";
const VERCEL_TEAM = process.env.VERCEL_TEAM_ID || "team_2Sd8tWqMXcE6tq4LER1v7sl5";
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

async function vercel(path: string, init?: RequestInit) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`https://api.vercel.com${path}${sep}teamId=${VERCEL_TEAM}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data } as {
    ok: boolean;
    status: number;
    data: { verified?: boolean; verification?: unknown[]; error?: { message?: string } };
  };
}

/**
 * POST /api/workspace/custom-domain
 *  { action: "add", domain } → register the domain on the Vercel project
 *  { action: "verify" }       → refresh verification status
 *  { action: "remove" }       → unregister + clear
 * Studio-gated, owner-only. Portals then serve at <domain>/portal/<shareToken>.
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = rateLimit(`ws-custom-domain:${ip}`, 10, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (!VERCEL_TOKEN) {
    return NextResponse.json({ error: "Custom domains aren't configured yet." }, { status: 503 });
  }

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
  if (!getEntitlements(ws.plan).customDomain) {
    return NextResponse.json(
      { error: "Custom domains are a Studio feature." },
      { status: 403 },
    );
  }

  const service = createSupabaseServiceClient();

  if (action === "add") {
    const domain = String(body.domain ?? "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!DOMAIN_RE.test(domain)) {
      return NextResponse.json({ error: "Enter a valid domain, e.g. portal.yourstudio.com." }, { status: 400 });
    }
    const add = await vercel(`/v10/projects/${VERCEL_PROJECT}/domains`, {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    });
    if (!add.ok) {
      return NextResponse.json(
        { error: add.data?.error?.message || "Vercel rejected the domain." },
        { status: add.status === 409 ? 409 : 400 },
      );
    }
    const status = add.data?.verified ? "verified" : "pending";
    await service.from("workspace_custom_domains").upsert(
      {
        workspace_id: ws.id,
        domain,
        status,
        verification: add.data?.verification ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id" },
    );
    return NextResponse.json({ domain, status, verification: add.data?.verification ?? [] });
  }

  if (action === "verify") {
    const { data: row } = await service
      .from("workspace_custom_domains")
      .select("domain")
      .eq("workspace_id", ws.id)
      .maybeSingle();
    if (!row?.domain) return NextResponse.json({ error: "Add a domain first." }, { status: 404 });
    const got = await vercel(`/v9/projects/${VERCEL_PROJECT}/domains/${row.domain}`);
    if (!got.ok) return NextResponse.json({ error: "Could not check status. Try again shortly." }, { status: 500 });
    const status = got.data?.verified ? "verified" : "pending";
    await service
      .from("workspace_custom_domains")
      .update({ status, verification: got.data?.verification ?? null, updated_at: new Date().toISOString() })
      .eq("workspace_id", ws.id);
    return NextResponse.json({ status, verification: got.data?.verification ?? [] });
  }

  if (action === "remove") {
    const { data: row } = await service
      .from("workspace_custom_domains")
      .select("domain")
      .eq("workspace_id", ws.id)
      .maybeSingle();
    if (row?.domain) {
      await vercel(`/v9/projects/${VERCEL_PROJECT}/domains/${row.domain}`, { method: "DELETE" });
      await service.from("workspace_custom_domains").delete().eq("workspace_id", ws.id);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
