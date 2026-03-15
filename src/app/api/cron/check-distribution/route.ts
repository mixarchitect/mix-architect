import { NextRequest, NextResponse } from "next/server";
import {
  detectSpotifyRelease,
  isSpotifyConfigured,
} from "@/lib/distribution/spotify-detection";
import {
  detectAppleMusicRelease,
  isAppleMusicConfigured,
} from "@/lib/distribution/apple-music-detection";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { notifyReleaseMembers } from "@/lib/notifications/service";
import { getPlatformLabel } from "@/lib/distribution/platforms";
import { emailReleaseMembers } from "@/lib/email/release-email";
import { buildReleaseLiveEmail } from "@/lib/email-templates/transactional";

const MAX_PER_RUN = 50;
const MAX_ERRORS = 5; // circuit breaker

/**
 * Cron job: check submitted Spotify / Apple Music entries for auto-detection.
 * Secured by CRON_SECRET header. Runs every 6 hours via Vercel cron.
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();

  // Get submitted/processing entries for auto-detectable platforms
  const { data: entries, error: fetchErr } = await supabase
    .from("release_distribution")
    .select("id, release_id, platform, status")
    .in("platform", ["spotify", "apple_music"])
    .in("status", ["submitted", "processing"])
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);

  if (fetchErr) {
    console.error("[cron/check-distribution] fetch error:", fetchErr);
    return NextResponse.json({ error: "DB query failed" }, { status: 500 });
  }

  if (!entries || entries.length === 0) {
    return NextResponse.json({ checked: 0, found: 0 });
  }

  // Group by release_id so we only fetch release info once per release
  const byRelease = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = byRelease.get(e.release_id) ?? [];
    list.push(e);
    byRelease.set(e.release_id, list);
  }

  let checked = 0;
  let found = 0;
  let errors = 0;

  for (const [releaseId, releaseEntries] of byRelease) {
    if (errors >= MAX_ERRORS) {
      console.warn("[cron/check-distribution] circuit breaker hit, stopping");
      break;
    }

    // Get release info
    const { data: release } = await supabase
      .from("releases")
      .select("id, title, artist")
      .eq("id", releaseId)
      .maybeSingle();

    if (!release?.title || !release?.artist) continue;

    // Get ISRC from first track
    let isrc: string | null = null;
    const { data: tracks } = await supabase
      .from("tracks")
      .select("id")
      .eq("release_id", releaseId)
      .order("track_number")
      .limit(1);

    if (tracks?.[0]) {
      const { data: trackDist } = await supabase
        .from("track_distribution")
        .select("isrc")
        .eq("track_id", tracks[0].id)
        .maybeSingle();
      isrc = trackDist?.isrc ?? null;
    }

    for (const entry of releaseEntries) {
      if (errors >= MAX_ERRORS) break;

      try {
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

        checked++;

        if (detection.found) {
          found++;

          await supabase
            .from("release_distribution")
            .update({
              status: "live",
              live_at: new Date().toISOString(),
              external_url: detection.url ?? null,
              auto_detected: true,
            })
            .eq("id", entry.id);

          const platformLabel = getPlatformLabel(entry.platform);
          await notifyReleaseMembers({
            releaseId,
            type: "distribution_live",
            title: `${release.title} is now live on ${platformLabel}`,
            body: detection.url ?? undefined,
          });

          // Send release-live email to all release members
          const appUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com"}/app/releases/${releaseId}`;
          await emailReleaseMembers({
            releaseId,
            category: "release_live",
            buildEmail: ({ unsubscribeUrl }) =>
              buildReleaseLiveEmail({
                releaseTitle: release.title,
                platformLabel,
                externalUrl: detection.url,
                appUrl,
                unsubscribeUrl,
              }),
          });
        }
      } catch (err) {
        errors++;
        console.error(
          `[cron/check-distribution] error checking ${entry.platform} for release ${releaseId}:`,
          err,
        );
      }
    }
  }

  console.log(
    `[cron/check-distribution] done: checked=${checked}, found=${found}, errors=${errors}`,
  );

  return NextResponse.json({ checked, found, errors });
}
