import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";

// Needs the Node runtime for Buffer (the binary upload body).
export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Release cover-art writes, server-side.
 *
 * Browser-direct storage uploads can go out with the anon key when the browser
 * session lapses (it falls back to the publishable key), which fails storage
 * RLS. So all cover-art mutations run here: cookie auth + an explicit ownership
 * check, the storage write via the service client (bypasses storage RLS), and
 * the DB write via the RLS-bound server client.
 *
 * POST  (multipart: file)        → upload + set releases.cover_art_url
 * PATCH (json: { url?: string })  → set/clear cover_art_url (paste URL / remove)
 */
async function requireOwnedRelease(req: NextRequest, releaseId: string) {
  const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: rel } = await supabase
    .from("releases")
    .select("id")
    .eq("id", releaseId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!rel) return { error: NextResponse.json({ error: "Release not found." }, { status: 404 }) };

  return { supabase, user };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ releaseId: string }> },
) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;
  const { success } = rateLimit(`cover-art:${getClientIp(req)}`, 30, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const { releaseId } = await params;
    const auth = await requireOwnedRelease(req, releaseId);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
    }
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
    const ext = EXT[file.type];
    if (!ext) return NextResponse.json({ error: "Use a PNG, JPG, WebP, or GIF image." }, { status: 400 });

    const service = createSupabaseServiceClient();
    const path = `${user.id}/${releaseId}.${ext}`;
    const body = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await service.storage
      .from("cover-art")
      .upload(path, body, { contentType: file.type, upsert: true });
    if (upErr) {
      console.error("[releases/cover-art] upload failed:", upErr);
      return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
    }

    const url = `${service.storage.from("cover-art").getPublicUrl(path).data.publicUrl}?t=${Date.now()}`;
    const { error: updErr } = await supabase
      .from("releases")
      .update({ cover_art_url: url })
      .eq("id", releaseId);
    if (updErr) {
      console.error("[releases/cover-art] db update failed:", updErr);
      return NextResponse.json({ error: `Saved image but couldn't update release: ${updErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[releases/cover-art] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ releaseId: string }> },
) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  try {
    const { releaseId } = await params;
    const auth = await requireOwnedRelease(req, releaseId);
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.url === "string" ? body.url.trim() : "";
    const url = raw || null;
    const { error: updErr } = await supabase
      .from("releases")
      .update({ cover_art_url: url })
      .eq("id", releaseId);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[releases/cover-art] PATCH error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
