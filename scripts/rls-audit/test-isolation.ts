/**
 * RLS Audit — Data Isolation Tests
 *
 * Verifies that User B cannot read, write, update, or delete
 * User A's data across every table with RLS policies.
 */

import type { TestContext } from "./setup.js";
import {
  expectEmpty,
  expectBlocked,
  expectUnchanged,
} from "./setup.js";

export async function runIsolationTests(ctx: TestContext): Promise<void> {
  const { userA, userB, seedA, serviceClient } = ctx;
  const clientB = userB.client;

  console.log("\n── Data Isolation Tests ──────────────────────────\n");

  // ════════════════════════════════════════════════════════════
  // GROUP 1: READ ISOLATION
  // ════════════════════════════════════════════════════════════

  console.log("  Read Isolation:");

  // releases
  const { data: releasesB } = await clientB.from("releases").select("*").eq("id", seedA.releaseId);
  expectEmpty({ data: releasesB, error: null }, "releases: B cannot read A's release by ID");

  // tracks
  const { data: tracksB } = await clientB.from("tracks").select("*").eq("release_id", seedA.releaseId);
  expectEmpty({ data: tracksB, error: null }, "tracks: B cannot read A's tracks");

  // track_intent
  const { data: intentB } = await clientB.from("track_intent").select("*").eq("track_id", seedA.trackIds[0]);
  expectEmpty({ data: intentB, error: null }, "track_intent: B cannot read A's intents");

  // track_specs
  const { data: specsB } = await clientB.from("track_specs").select("*").eq("track_id", seedA.trackIds[0]);
  expectEmpty({ data: specsB, error: null }, "track_specs: B cannot read A's specs");

  // track_elements
  const { data: elementsB } = await clientB.from("track_elements").select("*").eq("track_id", seedA.trackIds[0]);
  expectEmpty({ data: elementsB, error: null }, "track_elements: B cannot read A's elements");

  // revision_notes
  const { data: notesB } = await clientB.from("revision_notes").select("*").eq("track_id", seedA.trackIds[0]);
  expectEmpty({ data: notesB, error: null }, "revision_notes: B cannot read A's notes");

  // mix_references
  const { data: refsB } = await clientB.from("mix_references").select("*").eq("id", seedA.mixReferenceId);
  expectEmpty({ data: refsB, error: null }, "mix_references: B cannot read A's references");

  // track_audio_versions
  const { data: versionsB } = await clientB.from("track_audio_versions").select("*").eq("track_id", seedA.trackIds[0]);
  expectEmpty({ data: versionsB, error: null }, "track_audio_versions: B cannot read A's versions");

  // brief_shares
  const { data: sharesB } = await clientB.from("brief_shares").select("*").eq("id", seedA.briefShareId);
  expectEmpty({ data: sharesB, error: null }, "brief_shares: B cannot read A's shares");

  // portal_track_settings
  const { data: ptsB } = await clientB.from("portal_track_settings").select("*").eq("id", seedA.portalTrackSettingId);
  expectEmpty({ data: ptsB, error: null }, "portal_track_settings: B cannot read A's settings");

  // portal_version_settings
  const { data: pvsB } = await clientB.from("portal_version_settings").select("*").eq("id", seedA.portalVersionSettingId);
  expectEmpty({ data: pvsB, error: null }, "portal_version_settings: B cannot read A's settings");

  // track_distribution
  const { data: distB } = await clientB.from("track_distribution").select("*").eq("track_id", seedA.trackIds[0]);
  expectEmpty({ data: distB, error: null }, "track_distribution: B cannot read A's distribution");

  // track_splits
  const { data: splitsB } = await clientB.from("track_splits").select("*").eq("track_id", seedA.trackIds[0]);
  expectEmpty({ data: splitsB, error: null }, "track_splits: B cannot read A's splits");

  // notifications
  const { data: notifsB } = await clientB.from("notifications").select("*").eq("id", seedA.notificationId);
  expectEmpty({ data: notifsB, error: null }, "notifications: B cannot read A's notifications");

  // user_defaults
  const { data: defaultsB } = await clientB.from("user_defaults").select("*").eq("user_id", userA.id);
  expectEmpty({ data: defaultsB, error: null }, "user_defaults: B cannot read A's defaults");

  // saved_contacts
  const { data: contactsB } = await clientB.from("saved_contacts").select("*").eq("id", seedA.savedContactId);
  expectEmpty({ data: contactsB, error: null }, "saved_contacts: B cannot read A's contacts");

  // email_preferences
  const { data: emailPrefsB } = await clientB.from("email_preferences").select("*").eq("user_id", userA.id);
  expectEmpty({ data: emailPrefsB, error: null }, "email_preferences: B cannot read A's prefs");

  // integrations
  const { data: integB } = await clientB.from("integrations").select("*").eq("id", seedA.integrationId);
  expectEmpty({ data: integB, error: null }, "integrations: B cannot read A's integrations");

  // release_expenses
  const { data: expB } = await clientB.from("release_expenses").select("*").eq("id", seedA.releaseExpenseId);
  expectEmpty({ data: expB, error: null }, "release_expenses: B cannot read A's expenses");

  // release_time_entries
  const { data: teB } = await clientB.from("release_time_entries").select("*").eq("id", seedA.releaseTimeEntryId);
  expectEmpty({ data: teB, error: null }, "release_time_entries: B cannot read A's time entries");

  // conversion_jobs
  const { data: cjB } = await clientB.from("conversion_jobs").select("*").eq("id", seedA.conversionJobId);
  expectEmpty({ data: cjB, error: null }, "conversion_jobs: B cannot read A's jobs");

  // artist_photos
  const { data: apB } = await clientB.from("artist_photos").select("*").eq("id", seedA.artistPhotoId);
  expectEmpty({ data: apB, error: null }, "artist_photos: B cannot read A's photos");

  // release_members
  const { data: rmB } = await clientB.from("release_members").select("*").eq("id", seedA.releaseMemberId);
  expectEmpty({ data: rmB, error: null }, "release_members: B cannot read A's members");

  // email_log (service-role only — no user policies)
  const { data: emailLogB } = await clientB.from("email_log").select("*");
  expectEmpty({ data: emailLogB, error: null }, "email_log: B cannot read any email logs");

  // ════════════════════════════════════════════════════════════
  // GROUP 2: WRITE ISOLATION
  // ════════════════════════════════════════════════════════════

  console.log("\n  Write Isolation:");

  // B cannot insert track on A's release
  const insertTrack = await clientB.from("tracks").insert({
    release_id: seedA.releaseId,
    title: "Injected Track",
    track_number: 99,
  }).select();
  expectBlocked(insertTrack, "tracks: B cannot insert on A's release");

  // B cannot insert track_intent on A's track
  const insertIntent = await clientB.from("track_intent").insert({
    track_id: seedA.trackIds[0],
    mix_vision: "Injected",
  }).select();
  expectBlocked(insertIntent, "track_intent: B cannot insert on A's track");

  // B cannot insert track_elements on A's track
  const insertElement = await clientB.from("track_elements").insert({
    track_id: seedA.trackIds[0],
    name: "Injected Element",
  }).select();
  expectBlocked(insertElement, "track_elements: B cannot insert on A's track");

  // B cannot insert revision_notes on A's track
  const insertNote = await clientB.from("revision_notes").insert({
    track_id: seedA.trackIds[0],
    content: "Injected note",
    author: "Hacker",
  }).select();
  expectBlocked(insertNote, "revision_notes: B cannot insert on A's track");

  // B cannot insert audio version on A's track
  const insertVersion = await clientB.from("track_audio_versions").insert({
    track_id: seedA.trackIds[0],
    version_number: 99,
    audio_url: "https://evil.com/audio.wav",
    uploaded_by: "Hacker",
  }).select();
  expectBlocked(insertVersion, "track_audio_versions: B cannot insert on A's track");

  // B cannot insert notification for A
  const insertNotif = await clientB.from("notifications").insert({
    user_id: userA.id,
    type: "status_change",
    title: "Fake notification",
  }).select();
  expectBlocked(insertNotif, "notifications: B cannot insert notification for A");

  // B cannot insert expense on A's release with A's user_id
  const insertExpense = await clientB.from("release_expenses").insert({
    release_id: seedA.releaseId,
    user_id: userA.id,
    description: "Injected expense",
    amount: 9999,
  }).select();
  expectBlocked(insertExpense, "release_expenses: B cannot insert on A's release");

  // B cannot insert release_members on A's release
  const insertMember = await clientB.from("release_members").insert({
    release_id: seedA.releaseId,
    invited_email: "hacker@evil.com",
    role: "collaborator",
  }).select();
  expectBlocked(insertMember, "release_members: B cannot invite on A's release");

  // ════════════════════════════════════════════════════════════
  // GROUP 3: UPDATE ISOLATION
  // ════════════════════════════════════════════════════════════

  console.log("\n  Update Isolation:");

  // B cannot update A's release
  await clientB.from("releases").update({ title: "Hijacked" }).eq("id", seedA.releaseId);
  await expectUnchanged(serviceClient, "releases", seedA.releaseId, "title", "UserA Test Release", "releases: A's title unchanged after B's update attempt");

  // B cannot update A's track
  await clientB.from("tracks").update({ title: "Hijacked Track" }).eq("id", seedA.trackIds[0]);
  await expectUnchanged(serviceClient, "tracks", seedA.trackIds[0], "title", "UserA Track 1", "tracks: A's track unchanged after B's update attempt");

  // B cannot update A's notification (mark as read)
  await clientB.from("notifications").update({ read: true }).eq("id", seedA.notificationId);
  await expectUnchanged(serviceClient, "notifications", seedA.notificationId, "read", false, "notifications: A's notification unchanged after B's update attempt");

  // B cannot update A's user_defaults
  await clientB.from("user_defaults").update({ company_name: "Hijacked Corp" }).eq("id", seedA.userDefaultsId);
  await expectUnchanged(serviceClient, "user_defaults", seedA.userDefaultsId, "company_name", null, "user_defaults: A's defaults unchanged after B's update attempt");

  // B cannot update A's integrations
  await clientB.from("integrations").update({ provider_email: "hacker@evil.com" }).eq("id", seedA.integrationId);
  await expectUnchanged(serviceClient, "integrations", seedA.integrationId, "provider_email", "usera@test.com", "integrations: A's integration unchanged after B's update attempt");

  // ════════════════════════════════════════════════════════════
  // GROUP 4: DELETE ISOLATION
  // ════════════════════════════════════════════════════════════

  console.log("\n  Delete Isolation:");

  // B cannot delete A's release
  await clientB.from("releases").delete().eq("id", seedA.releaseId);
  const { data: releaseStillExists } = await serviceClient.from("releases").select("id").eq("id", seedA.releaseId).single();
  expectBlocked(
    { data: releaseStillExists ? null : [], error: releaseStillExists ? null : "deleted" },
    "releases: A's release still exists after B's delete attempt",
  );

  // B cannot delete A's tracks
  await clientB.from("tracks").delete().eq("id", seedA.trackIds[0]);
  const { data: trackStillExists } = await serviceClient.from("tracks").select("id").eq("id", seedA.trackIds[0]).single();
  expectBlocked(
    { data: trackStillExists ? null : [], error: trackStillExists ? null : "deleted" },
    "tracks: A's track still exists after B's delete attempt",
  );

  // B cannot delete A's notification
  await clientB.from("notifications").delete().eq("id", seedA.notificationId);
  const { data: notifStillExists } = await serviceClient.from("notifications").select("id").eq("id", seedA.notificationId).single();
  expectBlocked(
    { data: notifStillExists ? null : [], error: notifStillExists ? null : "deleted" },
    "notifications: A's notification still exists after B's delete attempt",
  );

  // B cannot delete A's integrations
  await clientB.from("integrations").delete().eq("id", seedA.integrationId);
  const { data: integStillExists } = await serviceClient.from("integrations").select("id").eq("id", seedA.integrationId).single();
  expectBlocked(
    { data: integStillExists ? null : [], error: integStillExists ? null : "deleted" },
    "integrations: A's integration still exists after B's delete attempt",
  );

  // B cannot delete A's artist photos
  await clientB.from("artist_photos").delete().eq("id", seedA.artistPhotoId);
  const { data: photoStillExists } = await serviceClient.from("artist_photos").select("id").eq("id", seedA.artistPhotoId).single();
  expectBlocked(
    { data: photoStillExists ? null : [], error: photoStillExists ? null : "deleted" },
    "artist_photos: A's photo still exists after B's delete attempt",
  );

  // ════════════════════════════════════════════════════════════
  // GROUP 5: ENUMERATION PROTECTION
  // ════════════════════════════════════════════════════════════

  console.log("\n  Enumeration Protection:");

  // B cannot find A's data by artist name
  const { data: enumByArtist } = await clientB.from("releases").select("*").eq("artist", "UserA Artist");
  expectEmpty({ data: enumByArtist, error: null }, "releases: B cannot find A's data by artist name");

  // B cannot traverse via join
  const { data: viaJoin } = await clientB
    .from("tracks")
    .select("*, releases!inner(*)")
    .eq("releases.user_id", userA.id);
  expectEmpty({ data: viaJoin, error: null }, "tracks: B cannot join-traverse to A's releases");

  // .or() filter bypass
  const { data: orBypass } = await clientB
    .from("releases")
    .select("*")
    .or(`user_id.eq.${userA.id},user_id.eq.${userB.id}`);
  // Should only return B's own releases
  if (orBypass && orBypass.length > 0) {
    const hasAData = orBypass.some((r: Record<string, unknown>) => r.user_id === userA.id);
    const passed = !hasAData;
    const { getResults } = await import("./setup.js");
    getResults().push({
      name: "releases: .or() filter does not bypass RLS",
      passed,
      detail: passed ? undefined : "A's data leaked through .or() filter",
    });
    console.log(
      passed
        ? "  PASS  releases: .or() filter does not bypass RLS"
        : "  FAIL  releases: .or() filter leaks A's data",
    );
  } else {
    const { getResults } = await import("./setup.js");
    getResults().push({
      name: "releases: .or() filter does not bypass RLS",
      passed: true,
    });
    console.log("  PASS  releases: .or() filter does not bypass RLS");
  }
}
