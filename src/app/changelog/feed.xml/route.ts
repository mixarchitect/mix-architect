import { getRecentEntries } from "@/lib/services/changelog";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

export async function GET() {
  const entries = await getRecentEntries(50);

  const items = entries
    .map(
      (entry) => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>https://mixarchitect.com/changelog/${escapeXml(entry.slug)}</link>
      <description>${escapeXml(entry.summary)}</description>
      <pubDate>${toRfc822(entry.published_at)}</pubDate>
      <category>${escapeXml(entry.category)}</category>
      <guid isPermaLink="true">https://mixarchitect.com/changelog/${escapeXml(entry.slug)}</guid>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mix Architect Changelog</title>
    <link>https://mixarchitect.com/changelog</link>
    <description>The latest features, improvements, and updates to Mix Architect.</description>
    <language>en-us</language>
    <atom:link href="https://mixarchitect.com/changelog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
