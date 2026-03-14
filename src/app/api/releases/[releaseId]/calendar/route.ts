import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { generateSingleReleaseIcal } from "@/lib/calendar";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ releaseId: string }> },
) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`calendar-release:${ip}`, 30, 60_000);
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

  const { data: release } = await supabase
    .from("releases")
    .select("id, title, artist, target_date")
    .eq("id", releaseId)
    .maybeSingle();

  if (!release) {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }

  if (!release.target_date) {
    return NextResponse.json(
      { error: "No target date set for this release" },
      { status: 400 },
    );
  }

  const baseUrl =
    request.headers.get("x-forwarded-proto") === "https"
      ? `https://${request.headers.get("host")}`
      : `http://${request.headers.get("host")}`;

  const ical = generateSingleReleaseIcal(release, baseUrl);
  if (!ical) {
    return NextResponse.json(
      { error: "Failed to generate calendar" },
      { status: 500 },
    );
  }

  const safeName = release.title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();
  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.ics"`,
    },
  });
}
