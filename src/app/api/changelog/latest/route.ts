import { NextResponse } from "next/server";
import { getLatestPublishedDate } from "@/lib/services/changelog";

export async function GET() {
  const published_at = await getLatestPublishedDate();

  return NextResponse.json(
    { published_at },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
