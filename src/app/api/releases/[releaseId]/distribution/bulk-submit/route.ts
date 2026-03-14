import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { PLATFORMS } from "@/lib/distribution/platforms";

type RouteContext = { params: Promise<{ releaseId: string }> };

const validPlatforms = new Set<string>(PLATFORMS.map((p) => p.id));

export async function POST(request: NextRequest, { params }: RouteContext) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`dist-bulk:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { releaseId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    platforms?: string[];
    distributor?: string;
  };

  if (!body.platforms || !Array.isArray(body.platforms) || body.platforms.length === 0) {
    return NextResponse.json(
      { error: "platforms[] is required" },
      { status: 400 },
    );
  }

  if (!body.distributor) {
    return NextResponse.json(
      { error: "distributor is required" },
      { status: 400 },
    );
  }

  // Filter to valid platforms only
  const platforms = body.platforms.filter((p) => validPlatforms.has(p));
  if (platforms.length === 0) {
    return NextResponse.json(
      { error: "No valid platforms provided" },
      { status: 400 },
    );
  }

  // Check which platforms already exist for this release
  const { data: existing } = await supabase
    .from("release_distribution")
    .select("platform")
    .eq("release_id", releaseId);

  const existingSet = new Set((existing ?? []).map((e: { platform: string }) => e.platform));
  const newPlatforms = platforms.filter((p) => !existingSet.has(p));

  if (newPlatforms.length === 0) {
    return NextResponse.json(
      { error: "All selected platforms are already tracked" },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const rows = newPlatforms.map((platform) => ({
    release_id: releaseId,
    platform,
    distributor: body.distributor!,
    status: "submitted" as const,
    submitted_at: now,
  }));

  const { data, error } = await supabase
    .from("release_distribution")
    .insert(rows)
    .select();

  if (error) {
    console.error("[distribution] bulk insert error:", error);
    return NextResponse.json(
      { error: "Failed to create entries" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { entries: data ?? [], skipped: platforms.length - newPlatforms.length },
    { status: 201 },
  );
}
