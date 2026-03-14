import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteContext = {
  params: Promise<{ releaseId: string; distId: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`dist-update:${ip}`, 20, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { distId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  // Only allow updating specific fields
  const allowed = [
    "status",
    "distributor",
    "external_url",
    "notes",
    "submitted_at",
    "live_at",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  // Auto-set timestamps based on status changes
  if (updates.status === "submitted" && !updates.submitted_at) {
    updates.submitted_at = new Date().toISOString();
  }
  if (updates.status === "live" && !updates.live_at) {
    updates.live_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("release_distribution")
    .update(updates)
    .eq("id", distId)
    .select()
    .single();

  if (error) {
    console.error("[distribution] update error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 },
    );
  }

  return NextResponse.json({ entry: data });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`dist-delete:${ip}`, 20, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { distId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("release_distribution")
    .delete()
    .eq("id", distId);

  if (error) {
    console.error("[distribution] delete error:", error);
    return NextResponse.json(
      { error: "Failed to remove entry" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
