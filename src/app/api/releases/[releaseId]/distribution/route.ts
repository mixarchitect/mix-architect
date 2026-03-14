import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { PLATFORMS } from "@/lib/distribution/platforms";

type RouteContext = { params: Promise<{ releaseId: string }> };

const validPlatforms = new Set<string>(PLATFORMS.map((p) => p.id));

export async function GET(request: NextRequest, { params }: RouteContext) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`dist-list:${ip}`, 30, 60_000);
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

  const { data, error } = await supabase
    .from("release_distribution")
    .select("*")
    .eq("release_id", releaseId)
    .order("platform");

  if (error) {
    console.error("[distribution] list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch distribution entries" },
      { status: 500 },
    );
  }

  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`dist-add:${ip}`, 20, 60_000);
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
    platform?: string;
    distributor?: string;
    status?: string;
    notes?: string;
    external_url?: string;
  };

  if (!body.platform || !validPlatforms.has(body.platform)) {
    return NextResponse.json(
      { error: "Invalid or missing platform" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("release_distribution")
    .insert({
      release_id: releaseId,
      platform: body.platform,
      distributor: body.distributor ?? null,
      status: body.status ?? "not_submitted",
      notes: body.notes ?? null,
      external_url: body.external_url ?? null,
      submitted_at:
        body.status === "submitted" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Platform already tracked for this release" },
        { status: 409 },
      );
    }
    console.error("[distribution] insert error:", error);
    return NextResponse.json(
      { error: "Failed to add platform" },
      { status: 500 },
    );
  }

  return NextResponse.json({ entry: data }, { status: 201 });
}
