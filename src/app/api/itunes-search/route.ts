import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`itunes:${ip}`, 10, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const term = request.nextUrl.searchParams.get("term");
  if (!term?.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=5`,
    );
    const json = await res.json();
    return NextResponse.json({ results: json.results ?? [] });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
