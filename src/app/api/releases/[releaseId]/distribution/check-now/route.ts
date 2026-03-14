import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  detectSpotifyRelease,
  isSpotifyConfigured,
} from "@/lib/distribution/spotify-detection";
import {
  detectAppleMusicRelease,
  isAppleMusicConfigured,
} from "@/lib/distribution/apple-music-detection";
import { notifyReleaseMembers } from "@/lib/notifications/service";
import { getPlatformLabel } from "@/lib/distribution/platforms";

type RouteContext = { params: Promise<{ releaseId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`dist-check:${ip}`, 3, 60_000);
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

  // Get release info for search
  const { data: release } = await supabase
    .from("releases")
    .select("id, title, artist, upc")
    .eq("id", releaseId)
    .maybeSingle();

  if (!release) {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }

  if (!release.artist || !release.title) {
    return NextResponse.json(
      { error: "Release needs a title and artist for detection" },
      { status: 400 },
    );
  }

  // Get submitted/processing entries for auto-detectable platforms
  const { data: entries } = await supabase
    .from("release_distribution")
    .select("*")
    .eq("release_id", releaseId)
    .in("platform", ["spotify", "apple_music"])
    .in("status", ["submitted", "processing"]);

  if (!entries || entries.length === 0) {
    return NextResponse.json({
      results: [],
      message: "No submitted entries to check",
    });
  }

  // Get ISRC from first track's distribution data (if available)
  const { data: tracks } = await supabase
    .from("tracks")
    .select("id")
    .eq("release_id", releaseId)
    .order("track_number")
    .limit(1);

  let isrc: string | null = null;
  if (tracks?.[0]) {
    const { data: trackDist } = await supabase
      .from("track_distribution")
      .select("isrc")
      .eq("track_id", tracks[0].id)
      .maybeSingle();
    isrc = trackDist?.isrc ?? null;
  }

  const results: Array<{
    platform: string;
    found: boolean;
    url?: string;
  }> = [];

  for (const entry of entries) {
    let detection = { found: false, url: undefined as string | undefined };

    if (entry.platform === "spotify" && isSpotifyConfigured()) {
      const result = await detectSpotifyRelease({
        isrc,
        releaseTitle: release.title,
        artist: release.artist,
      });
      detection = { found: result.found, url: result.url };
    } else if (entry.platform === "apple_music" && isAppleMusicConfigured()) {
      const result = await detectAppleMusicRelease({
        isrc,
        releaseTitle: release.title,
        artist: release.artist,
      });
      detection = { found: result.found, url: result.url };
    }

    if (detection.found) {
      // Update to live
      await supabase
        .from("release_distribution")
        .update({
          status: "live",
          live_at: new Date().toISOString(),
          external_url: detection.url ?? null,
          auto_detected: true,
        })
        .eq("id", entry.id);

      // Fire notification
      const platformLabel = getPlatformLabel(entry.platform);
      await notifyReleaseMembers({
        releaseId,
        type: "distribution_live",
        title: `${release.title} is now live on ${platformLabel}`,
        body: detection.url ?? undefined,
      });
    }

    results.push({
      platform: entry.platform,
      found: detection.found,
      url: detection.url,
    });
  }

  return NextResponse.json({ results });
}
