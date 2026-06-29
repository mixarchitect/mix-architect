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

const slug = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9]/g, "-");
const key = (name: string) => name.toLowerCase().trim();

/**
 * Artist-photo writes, server-side — same reasoning as the cover-art route:
 * browser-direct storage uploads can fall back to the anon key and fail RLS.
 * Auth via cookies; the storage write uses the service client (bypasses storage
 * RLS); the artist_photos write uses the RLS-bound server client. user_id is
 * always derived from the session, never the request body.
 *
 * POST   (multipart: file, artistName)  → upload + upsert artist_photos
 * PATCH  (json: { artistName, url })     → set photo_url (paste URL)
 * DELETE (json: { artistName })          → remove the photo row
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;
  const { success } = rateLimit(`artist-photo:${getClientIp(req)}`, 30, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
    }
    const file = form.get("file");
    const artistName = form.get("artistName");
    if (typeof artistName !== "string" || !artistName.trim()) {
      return NextResponse.json({ error: "Missing artist name." }, { status: 400 });
    }
    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
    const ext = EXT[file.type];
    if (!ext) return NextResponse.json({ error: "Use a PNG, JPG, WebP, or GIF image." }, { status: 400 });

    const service = createSupabaseServiceClient();
    const path = `${user.id}/artist-${slug(artistName)}.${ext}`;
    const body = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await service.storage
      .from("cover-art")
      .upload(path, body, { contentType: file.type, upsert: true });
    if (upErr) {
      console.error("[artist-photo] upload failed:", upErr);
      return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
    }

    const url = `${service.storage.from("cover-art").getPublicUrl(path).data.publicUrl}?t=${Date.now()}`;
    const { error: dbErr } = await supabase.from("artist_photos").upsert(
      { user_id: user.id, artist_name_key: key(artistName), photo_url: url },
      { onConflict: "user_id,artist_name_key" },
    );
    if (dbErr) {
      console.error("[artist-photo] db upsert failed:", dbErr);
      return NextResponse.json({ error: `Saved image but couldn't save photo: ${dbErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[artist-photo] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  try {
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const artistName = typeof body.artistName === "string" ? body.artistName : "";
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!artistName.trim() || !url) {
      return NextResponse.json({ error: "Missing artist name or URL." }, { status: 400 });
    }
    const { error: dbErr } = await supabase.from("artist_photos").upsert(
      { user_id: user.id, artist_name_key: key(artistName), photo_url: url },
      { onConflict: "user_id,artist_name_key" },
    );
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[artist-photo] PATCH error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  try {
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const artistName = typeof body.artistName === "string" ? body.artistName : "";
    if (!artistName.trim()) return NextResponse.json({ error: "Missing artist name." }, { status: 400 });

    const { error: dbErr } = await supabase
      .from("artist_photos")
      .delete()
      .eq("user_id", user.id)
      .eq("artist_name_key", key(artistName));
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[artist-photo] DELETE error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
