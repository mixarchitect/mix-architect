import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { generateUserFeedIcal } from "@/lib/calendar";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`calendar-feed:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { token } = await params;
  if (!token || token.length < 16) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Use service client since this is token-based auth (no session cookie)
  const supabase = createSupabaseServiceClient();

  const { data: userDefaults } = await supabase
    .from("user_defaults")
    .select("user_id")
    .eq("calendar_feed_token", token)
    .maybeSingle();

  if (!userDefaults) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { data: releases } = await supabase
    .from("releases")
    .select("id, title, artist, target_date")
    .eq("user_id", userDefaults.user_id)
    .not("target_date", "is", null)
    .neq("status", "draft");

  const baseUrl =
    request.headers.get("x-forwarded-proto") === "https"
      ? `https://${request.headers.get("host")}`
      : `http://${request.headers.get("host")}`;

  const ical = generateUserFeedIcal(releases ?? [], baseUrl);

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
