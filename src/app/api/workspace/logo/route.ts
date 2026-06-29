import { NextRequest, NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";
import { getEntitlements } from "@/lib/entitlements";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/**
 * POST /api/workspace/logo  (multipart: file)
 * Uploads a portal-branding logo. SVGs are SANITIZED here (DOMPurify, SVG
 * profile, no <script>/<foreignObject>) before being written to the PUBLIC
 * workspace-logos bucket — otherwise a malicious SVG opened at its public URL
 * would execute scripts. Studio/Pro only; owner-only. Returns the storage path.
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = rateLimit(`ws-logo:${ip}`, 20, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

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
  if (getEntitlements(ws.plan).branding === "none") {
    return NextResponse.json({ error: "Portal branding is a paid feature." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Logo must be under 5MB." }, { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return NextResponse.json({ error: "Use a PNG, JPG, WebP, or SVG image." }, { status: 400 });

  let body: Buffer;
  if (file.type === "image/svg+xml") {
    const raw = await file.text();
    const clean = DOMPurify.sanitize(raw, {
      USE_PROFILES: { svg: true, svgFilters: true },
      FORBID_TAGS: ["script", "foreignObject"],
    });
    if (!clean || !clean.includes("<svg")) {
      return NextResponse.json({ error: "That SVG couldn't be processed safely." }, { status: 400 });
    }
    body = Buffer.from(clean, "utf8");
  } else {
    body = Buffer.from(await file.arrayBuffer());
  }

  const path = `${user.id}/logo.${ext}`;
  const service = createSupabaseServiceClient();
  const { error: upErr } = await service.storage
    .from("workspace-logos")
    .upload(path, body, { contentType: file.type, upsert: true });
  if (upErr) {
    console.error("[workspace/logo] upload failed:", upErr);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  return NextResponse.json({ path });
}
