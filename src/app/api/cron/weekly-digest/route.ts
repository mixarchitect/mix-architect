import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import {
  sendTransactionalEmail,
  buildUnsubscribeUrl,
} from "@/lib/email/service";
import {
  buildWeeklyDigestEmail,
  type DigestStats,
} from "@/lib/email-templates/transactional";

const MAX_USERS_PER_RUN = 50;
const MAX_ERRORS = 5;

/**
 * GET /api/cron/weekly-digest
 * Weekly digest email cron job. Sends activity summaries to opted-in users.
 * Secured by CRON_SECRET header. Runs every Monday at 2 PM UTC.
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com";
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Get users who have weekly_digest enabled
  const { data: prefs, error: prefsErr } = await supabase
    .from("email_preferences")
    .select("user_id, unsubscribe_token")
    .eq("weekly_digest", true)
    .limit(MAX_USERS_PER_RUN);

  if (prefsErr) {
    console.error("[cron/weekly-digest] prefs fetch error:", prefsErr);
    return NextResponse.json({ error: "DB query failed" }, { status: 500 });
  }

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const pref of prefs) {
    if (errors >= MAX_ERRORS) {
      console.warn("[cron/weekly-digest] circuit breaker hit, stopping");
      break;
    }

    try {
      const userId = pref.user_id;

      // Get user's releases (owned)
      const { data: releases } = await supabase
        .from("releases")
        .select("id")
        .eq("user_id", userId);

      // Also get releases where user is a collaborator
      const { data: collabReleases } = await supabase
        .from("release_members")
        .select("release_id")
        .eq("user_id", userId)
        .not("accepted_at", "is", null);

      const releaseIds = new Set<string>();
      for (const r of releases ?? []) releaseIds.add(r.id);
      for (const r of collabReleases ?? []) releaseIds.add(r.release_id);

      if (releaseIds.size === 0) {
        skipped++;
        continue;
      }

      const releaseIdArray = Array.from(releaseIds);

      // Aggregate stats for the past 7 days
      const stats: DigestStats = {
        newComments: 0,
        audioUploads: 0,
        statusChanges: 0,
        newCollaborators: 0,
      };

      // New comments on user's releases' tracks
      const { data: tracks } = await supabase
        .from("tracks")
        .select("id")
        .in("release_id", releaseIdArray);

      if (tracks && tracks.length > 0) {
        const trackIds = tracks.map((t) => t.id);
        const { count: commentCount } = await supabase
          .from("revision_notes")
          .select("id", { count: "exact", head: true })
          .in("track_id", trackIds)
          .gte("created_at", sevenDaysAgo);
        stats.newComments = commentCount ?? 0;
      }

      // Audio uploads on user's tracks
      if (tracks && tracks.length > 0) {
        const trackIds = tracks.map((t) => t.id);
        const { count: uploadCount } = await supabase
          .from("audio_versions")
          .select("id", { count: "exact", head: true })
          .in("track_id", trackIds)
          .gte("created_at", sevenDaysAgo);
        stats.audioUploads = uploadCount ?? 0;
      }

      // Distribution status changes (two-step: get dist IDs, then count history)
      const { data: distEntries } = await supabase
        .from("release_distribution")
        .select("id")
        .in("release_id", releaseIdArray);

      if (distEntries && distEntries.length > 0) {
        const distIds = distEntries.map((d) => d.id);
        const { count: statusCount } = await supabase
          .from("release_distribution_history")
          .select("id", { count: "exact", head: true })
          .in("distribution_id", distIds)
          .gte("created_at", sevenDaysAgo);
        stats.statusChanges = statusCount ?? 0;
      }

      // New collaborators joined
      const { count: collabCount } = await supabase
        .from("release_members")
        .select("id", { count: "exact", head: true })
        .in("release_id", releaseIdArray)
        .gte("accepted_at", sevenDaysAgo);
      stats.newCollaborators = collabCount ?? 0;

      // Skip if no activity
      const totalActivity =
        stats.newComments +
        stats.audioUploads +
        stats.statusChanges +
        stats.newCollaborators;

      if (totalActivity === 0) {
        skipped++;
        continue;
      }

      // Get user email and display name
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(userId);

      if (!user?.email) {
        skipped++;
        continue;
      }

      const displayName =
        user.user_metadata?.display_name ?? user.email.split("@")[0];

      const unsubscribeUrl = pref.unsubscribe_token
        ? buildUnsubscribeUrl(pref.unsubscribe_token, "weekly_digest")
        : undefined;

      const { subject, html } = buildWeeklyDigestEmail({
        displayName,
        stats,
        appUrl: `${appUrl}/app`,
        unsubscribeUrl,
      });

      await sendTransactionalEmail({
        userId,
        to: user.email,
        category: "weekly_digest",
        subject,
        html,
      });

      sent++;
    } catch (err) {
      errors++;
      console.error(
        `[cron/weekly-digest] error for user ${pref.user_id}:`,
        err,
      );
    }
  }

  console.log(
    `[cron/weekly-digest] done: sent=${sent}, skipped=${skipped}, errors=${errors}`,
  );

  return NextResponse.json({ sent, skipped, errors });
}
