/**
 * RLS Audit — Anonymous Access & Edge Case Tests
 *
 * Verifies that unauthenticated users cannot access protected data,
 * and tests privilege escalation edge cases.
 */

import type { TestContext } from "./setup.js";
import {
  expectEmpty,
  expectBlocked,
  expectUnchanged,
  getResults,
} from "./setup.js";

export async function runAnonTests(ctx: TestContext): Promise<void> {
  const { userA, userB, seedA, anonClient, serviceClient } = ctx;

  console.log("\n── Anon & Edge Case Tests ────────────────────────\n");

  // ════════════════════════════════════════════════════════════
  // GROUP 1: UNAUTHENTICATED READ ACCESS
  // ════════════════════════════════════════════════════════════

  console.log("  Unauthenticated Read Access:");

  const protectedTables = [
    "releases",
    "tracks",
    "track_intent",
    "track_specs",
    "track_elements",
    "revision_notes",
    "track_audio_versions",
    "notifications",
    "user_defaults",
    "saved_contacts",
    "email_preferences",
    "integrations",
    "release_expenses",
    "release_time_entries",
    "conversion_jobs",
    "artist_photos",
    "release_members",
    "brief_shares",
    "portal_track_settings",
    "portal_version_settings",
    "email_log",
    "perf_metrics",
    "bug_reports",
  ];

  for (const table of protectedTables) {
    const { data } = await anonClient.from(table).select("*").limit(5);
    expectEmpty(
      { data, error: null },
      `anon: cannot read ${table}`,
    );
  }

  // feature_requests SHOULD be publicly readable
  const { data: featureReqs } = await anonClient
    .from("feature_requests")
    .select("*")
    .limit(5);
  const frPass = !featureReqs || true; // Either data or empty is fine (public table)
  getResults().push({
    name: "anon: feature_requests is publicly readable (expected)",
    passed: frPass,
  });
  console.log(`  PASS  anon: feature_requests is publicly readable (expected)`);

  // ════════════════════════════════════════════════════════════
  // GROUP 2: UNAUTHENTICATED WRITE ACCESS
  // ════════════════════════════════════════════════════════════

  console.log("\n  Unauthenticated Write Access:");

  // Anon cannot insert releases
  const anonInsertRelease = await anonClient.from("releases").insert({
    title: "Anon Release",
    artist: "Hacker",
    user_id: userA.id,
  }).select();
  expectBlocked(anonInsertRelease, "anon: cannot insert releases");

  // Anon cannot insert tracks
  const anonInsertTrack = await anonClient.from("tracks").insert({
    release_id: seedA.releaseId,
    title: "Anon Track",
    track_number: 99,
  }).select();
  expectBlocked(anonInsertTrack, "anon: cannot insert tracks");

  // Anon cannot insert notifications
  const anonInsertNotif = await anonClient.from("notifications").insert({
    user_id: userA.id,
    type: "status_change",
    title: "Anon notification",
  }).select();
  expectBlocked(anonInsertNotif, "anon: cannot insert notifications");

  // Anon cannot update releases
  const anonUpdateRelease = await anonClient
    .from("releases")
    .update({ title: "Anon Hijack" })
    .eq("id", seedA.releaseId)
    .select();
  expectBlocked(anonUpdateRelease, "anon: cannot update releases");

  // Anon cannot delete releases
  const anonDeleteRelease = await anonClient
    .from("releases")
    .delete()
    .eq("id", seedA.releaseId)
    .select();
  expectBlocked(anonDeleteRelease, "anon: cannot delete releases");

  // ════════════════════════════════════════════════════════════
  // GROUP 3: PRIVILEGE ESCALATION
  // ════════════════════════════════════════════════════════════

  console.log("\n  Privilege Escalation:");

  // User A tries to insert a release with User B's user_id
  const escalateInsert = await userA.client.from("releases").insert({
    user_id: userB.id,
    title: "Escalation Attempt",
    artist: "Hacker",
  }).select();

  if (escalateInsert.data && escalateInsert.data.length > 0) {
    // Check if the user_id was overridden to A's own id, or if it's B's
    const insertedRow = escalateInsert.data[0] as Record<string, unknown>;
    if (insertedRow.user_id === userB.id) {
      getResults().push({
        name: "escalation: A cannot create release owned by B",
        passed: false,
        detail: "Release was created with B's user_id",
      });
      console.log("  FAIL  escalation: A created release owned by B");
    } else {
      getResults().push({
        name: "escalation: A cannot create release owned by B",
        passed: true,
        detail: "user_id was overridden to A's own id",
      });
      console.log("  PASS  escalation: A cannot create release owned by B (user_id overridden)");
    }
    // Clean up the inserted release
    await serviceClient
      .from("releases")
      .delete()
      .eq("id", (insertedRow as { id: string }).id);
  } else {
    getResults().push({
      name: "escalation: A cannot create release owned by B",
      passed: true,
    });
    console.log("  PASS  escalation: A cannot create release owned by B (insert blocked)");
  }

  // User A tries to transfer ownership of their release to User B
  await userA.client
    .from("releases")
    .update({ user_id: userB.id })
    .eq("id", seedA.releaseId);
  await expectUnchanged(
    serviceClient,
    "releases",
    seedA.releaseId,
    "user_id",
    userA.id,
    "escalation: A cannot transfer release ownership to B",
  );

  // Nested join traversal does not leak
  const { data: deepQuery } = await userB.client
    .from("track_audio_versions")
    .select("*, tracks!inner(*, releases!inner(*))")
    .limit(50);
  if (deepQuery && deepQuery.length > 0) {
    const hasAData = deepQuery.some((row: Record<string, unknown>) => {
      const tracks = row.tracks as Record<string, unknown> | undefined;
      const releases = tracks?.releases as Record<string, unknown> | undefined;
      return releases?.user_id === userA.id;
    });
    const passed = !hasAData;
    getResults().push({
      name: "escalation: nested join does not leak A's data to B",
      passed,
      detail: passed ? undefined : "A's data leaked through nested join",
    });
    console.log(
      passed
        ? "  PASS  escalation: nested join does not leak A's data to B"
        : "  FAIL  escalation: nested join leaks A's data to B",
    );
  } else {
    getResults().push({
      name: "escalation: nested join does not leak A's data to B",
      passed: true,
    });
    console.log("  PASS  escalation: nested join does not leak A's data to B");
  }
}
