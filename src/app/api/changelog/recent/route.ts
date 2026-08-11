import { NextResponse } from "next/server";
import { getRecentEntries } from "@/lib/services/changelog";

export async function GET(req: Request) {
  const param = new URL(req.url).searchParams.get("limit");
  const raw = param === null ? NaN : Number(param);
  const limit = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), 20) : 3;
  const entries = await getRecentEntries(limit);

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
