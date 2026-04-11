import { NextResponse } from "next/server";
import { getRecentEntries } from "@/lib/services/changelog";

export async function GET() {
  const entries = await getRecentEntries(5);

  return NextResponse.json(
    {
      entries: entries.map((e) => ({
        slug: e.slug,
        title: e.title,
        summary: e.summary,
        category: e.category,
        published_at: e.published_at,
        version_tag: e.version_tag ?? null,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
