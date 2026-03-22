/**
 * RLS Audit — Test Infrastructure
 *
 * Creates two test users, seeds data for both, and provides
 * assertion helpers and cleanup functions.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Environment ──────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing env vars. Ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set.",
  );
}

// ── Test user credentials ────────────────────────────────────────

const USER_A_EMAIL = "rls-test-user-a@mixarchitect-rls-test.com";
const USER_A_PASS = "RlsTestA!2026secure";
const USER_B_EMAIL = "rls-test-user-b@mixarchitect-rls-test.com";
const USER_B_PASS = "RlsTestB!2026secure";

// ── Types ────────────────────────────────────────────────────────

export type TestUser = {
  id: string;
  email: string;
  client: SupabaseClient;
};

export type SeedIds = {
  releaseId: string;
  trackIds: string[];
  trackIntentIds: string[];
  trackSpecIds: string[];
  trackElementIds: string[];
  revisionNoteIds: string[];
  mixReferenceId: string;
  audioVersionIds: string[];
  briefShareId: string;
  portalTrackSettingId: string;
  portalVersionSettingId: string;
  trackDistributionIds: string[];
  trackSplitIds: string[];
  userDefaultsId: string;
  savedContactId: string;
  notificationId: string;
  emailPreferencesId: string;
  integrationId: string;
  releaseExpenseId: string;
  releaseTimeEntryId: string;
  conversionJobId: string;
  artistPhotoId: string;
  releaseMemberId: string;
};

export type TestContext = {
  userA: TestUser;
  userB: TestUser;
  seedA: SeedIds;
  seedB: SeedIds;
  serviceClient: SupabaseClient;
  anonClient: SupabaseClient;
};

// ── Test results tracking ────────────────────────────────────────

export type TestResult = { name: string; passed: boolean; detail?: string };
const results: TestResult[] = [];

export function getResults(): TestResult[] {
  return results;
}

export function clearResults(): void {
  results.length = 0;
}

// ── Assertion helpers ────────────────────────────────────────────

export function expectEmpty(
  result: { data: unknown[] | null; error: unknown },
  testName: string,
): boolean {
  const passed = !result.data || result.data.length === 0;
  results.push({
    name: testName,
    passed,
    detail: passed
      ? undefined
      : `returned ${result.data?.length ?? "?"} rows`,
  });
  console.log(passed ? `  PASS  ${testName}` : `  FAIL  ${testName} — returned ${result.data?.length} rows`);
  return passed;
}

export function expectOwned(
  data: Record<string, unknown>[] | null,
  userId: string,
  testName: string,
  userIdColumn = "user_id",
): boolean {
  if (!data || data.length === 0) {
    // No data is fine — means the user has no rows (could be expected)
    results.push({ name: testName, passed: true });
    console.log(`  PASS  ${testName} (no rows)`);
    return true;
  }
  const foreign = data.filter(
    (row) => row[userIdColumn] !== undefined && row[userIdColumn] !== userId,
  );
  const passed = foreign.length === 0;
  results.push({
    name: testName,
    passed,
    detail: passed
      ? undefined
      : `found ${foreign.length} rows owned by other users`,
  });
  console.log(
    passed
      ? `  PASS  ${testName}`
      : `  FAIL  ${testName} — found ${foreign.length} foreign rows`,
  );
  return passed;
}

export function expectError(
  result: { error: unknown },
  testName: string,
): boolean {
  const passed = !!result.error;
  results.push({
    name: testName,
    passed,
    detail: passed ? undefined : "expected error but got success",
  });
  console.log(
    passed
      ? `  PASS  ${testName}`
      : `  FAIL  ${testName} — expected error but got success`,
  );
  return passed;
}

export function expectBlocked(
  result: { data: unknown[] | null; error: unknown },
  testName: string,
): boolean {
  // Supabase RLS-blocked mutations often return { data: [], error: null }
  const passed =
    !!result.error || !result.data || result.data.length === 0;
  results.push({
    name: testName,
    passed,
    detail: passed
      ? undefined
      : `expected blocked but got ${result.data?.length} rows`,
  });
  console.log(
    passed
      ? `  PASS  ${testName}`
      : `  FAIL  ${testName} — operation was not blocked`,
  );
  return passed;
}

export async function expectUnchanged(
  serviceClient: SupabaseClient,
  table: string,
  id: string,
  field: string,
  expectedValue: unknown,
  testName: string,
): Promise<boolean> {
  const { data } = await serviceClient
    .from(table)
    .select(field)
    .eq("id", id)
    .single();
  const row = data as Record<string, unknown> | null;
  const passed = row !== null && row[field] === expectedValue;
  results.push({
    name: testName,
    passed,
    detail: passed
      ? undefined
      : `expected ${String(expectedValue)}, got ${row ? String(row[field]) : "null"}`,
  });
  console.log(
    passed
      ? `  PASS  ${testName}`
      : `  FAIL  ${testName} — value was changed`,
  );
  return !!passed;
}

// ── Client creation ──────────────────────────────────────────────

export function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function createAuthenticatedClient(
  email: string,
  password: string,
): Promise<{ client: SupabaseClient; userId: string }> {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Try sign in first (user may already exist from a previous partial run)
  const { data: signInData, error: signInError } =
    await client.auth.signInWithPassword({ email, password });

  if (!signInError && signInData.user) {
    return { client, userId: signInData.user.id };
  }

  // Sign up
  const { data: signUpData, error: signUpError } = await client.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    throw new Error(`Failed to create user ${email}: ${signUpError.message}`);
  }

  if (!signUpData.user) {
    throw new Error(
      `User ${email} created but needs email confirmation. ` +
        `Disable "Confirm email" in Supabase Auth settings for test accounts, ` +
        `or manually confirm the test users.`,
    );
  }

  // Sign in to get a session
  const { data: sessionData, error: sessionError } =
    await client.auth.signInWithPassword({ email, password });

  if (sessionError || !sessionData.user) {
    throw new Error(
      `Failed to sign in as ${email}: ${sessionError?.message ?? "no user returned"}`,
    );
  }

  return { client, userId: sessionData.user.id };
}

// ── Seed data ────────────────────────────────────────────────────

async function seedUser(
  serviceClient: SupabaseClient,
  userId: string,
  label: string,
): Promise<SeedIds> {
  // Release
  const { data: release, error: releaseErr } = await serviceClient
    .from("releases")
    .insert({
      user_id: userId,
      title: `${label} Test Release`,
      artist: `${label} Artist`,
      release_type: "single",
      format: "stereo",
      status: "draft",
    })
    .select("id")
    .single();
  if (releaseErr) throw new Error(`Seed release: ${releaseErr.message}`);
  const releaseId = release!.id;

  // Tracks (2)
  const { data: tracks, error: tracksErr } = await serviceClient
    .from("tracks")
    .insert([
      { release_id: releaseId, title: `${label} Track 1`, track_number: 1 },
      { release_id: releaseId, title: `${label} Track 2`, track_number: 2 },
    ])
    .select("id");
  if (tracksErr) throw new Error(`Seed tracks: ${tracksErr.message}`);
  const trackIds = tracks!.map((t: { id: string }) => t.id);

  // Track intent (1 per track)
  const { data: intents, error: intentsErr } = await serviceClient
    .from("track_intent")
    .insert(
      trackIds.map((tid: string) => ({
        track_id: tid,
        mix_vision: `${label} vision`,
      })),
    )
    .select("id");
  if (intentsErr) throw new Error(`Seed track_intent: ${intentsErr.message}`);
  const trackIntentIds = intents!.map((i: { id: string }) => i.id);

  // Track specs (1 per track)
  const { data: specs, error: specsErr } = await serviceClient
    .from("track_specs")
    .insert(
      trackIds.map((tid: string) => ({
        track_id: tid,
        target_loudness: "-14 LUFS",
      })),
    )
    .select("id");
  if (specsErr) throw new Error(`Seed track_specs: ${specsErr.message}`);
  const trackSpecIds = specs!.map((s: { id: string }) => s.id);

  // Track elements (2 per track)
  const { data: elements, error: elementsErr } = await serviceClient
    .from("track_elements")
    .insert(
      trackIds.flatMap((tid: string) => [
        { track_id: tid, name: `${label} Kick`, sort_order: 0 },
        { track_id: tid, name: `${label} Snare`, sort_order: 1 },
      ]),
    )
    .select("id");
  if (elementsErr)
    throw new Error(`Seed track_elements: ${elementsErr.message}`);
  const trackElementIds = elements!.map((e: { id: string }) => e.id);

  // Audio versions (1 per track)
  const { data: versions, error: versionsErr } = await serviceClient
    .from("track_audio_versions")
    .insert(
      trackIds.map((tid: string) => ({
        track_id: tid,
        version_number: 1,
        audio_url: `https://example.com/${label}-audio.wav`,
        file_name: `${label}-audio.wav`,
        uploaded_by: label,
      })),
    )
    .select("id");
  if (versionsErr)
    throw new Error(`Seed track_audio_versions: ${versionsErr.message}`);
  const audioVersionIds = versions!.map((v: { id: string }) => v.id);

  // Revision notes (1 per track)
  const { data: notes, error: notesErr } = await serviceClient
    .from("revision_notes")
    .insert(
      trackIds.map((tid: string, i: number) => ({
        track_id: tid,
        content: `${label} revision note`,
        author: label,
        audio_version_id: audioVersionIds[i],
      })),
    )
    .select("id");
  if (notesErr) throw new Error(`Seed revision_notes: ${notesErr.message}`);
  const revisionNoteIds = notes!.map((n: { id: string }) => n.id);

  // Mix references (release-level)
  const { data: mixRef, error: mixRefErr } = await serviceClient
    .from("mix_references")
    .insert({
      release_id: releaseId,
      song_title: `${label} Reference Song`,
      artist: `${label} Ref Artist`,
    })
    .select("id")
    .single();
  if (mixRefErr) throw new Error(`Seed mix_references: ${mixRefErr.message}`);

  // Brief shares
  const { data: briefShare, error: briefShareErr } = await serviceClient
    .from("brief_shares")
    .insert({ release_id: releaseId })
    .select("id")
    .single();
  if (briefShareErr)
    throw new Error(`Seed brief_shares: ${briefShareErr.message}`);

  // Portal track settings
  const { data: pts, error: ptsErr } = await serviceClient
    .from("portal_track_settings")
    .insert({
      brief_share_id: briefShare!.id,
      track_id: trackIds[0],
      visible: true,
      download_enabled: true,
    })
    .select("id")
    .single();
  if (ptsErr)
    throw new Error(`Seed portal_track_settings: ${ptsErr.message}`);

  // Portal version settings
  const { data: pvs, error: pvsErr } = await serviceClient
    .from("portal_version_settings")
    .insert({
      brief_share_id: briefShare!.id,
      audio_version_id: audioVersionIds[0],
      visible: true,
    })
    .select("id")
    .single();
  if (pvsErr)
    throw new Error(`Seed portal_version_settings: ${pvsErr.message}`);

  // Track distribution (1 per track)
  const { data: dists, error: distsErr } = await serviceClient
    .from("track_distribution")
    .insert(trackIds.map((tid: string) => ({ track_id: tid })))
    .select("id");
  if (distsErr)
    throw new Error(`Seed track_distribution: ${distsErr.message}`);
  const trackDistributionIds = dists!.map((d: { id: string }) => d.id);

  // Track splits (1 per track)
  const { data: splits, error: splitsErr } = await serviceClient
    .from("track_splits")
    .insert(
      trackIds.map((tid: string) => ({
        track_id: tid,
        split_type: "writing",
        person_name: `${label} Writer`,
        percentage: 100,
      })),
    )
    .select("id");
  if (splitsErr) throw new Error(`Seed track_splits: ${splitsErr.message}`);
  const trackSplitIds = splits!.map((s: { id: string }) => s.id);

  // User defaults
  const { data: ud, error: udErr } = await serviceClient
    .from("user_defaults")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (udErr) throw new Error(`Seed user_defaults: ${udErr.message}`);

  // Saved contacts
  const { data: sc, error: scErr } = await serviceClient
    .from("saved_contacts")
    .insert({
      user_id: userId,
      person_name: `${label} Contact`,
    })
    .select("id")
    .single();
  if (scErr) throw new Error(`Seed saved_contacts: ${scErr.message}`);

  // Notifications
  const { data: notif, error: notifErr } = await serviceClient
    .from("notifications")
    .insert({
      user_id: userId,
      type: "status_change",
      title: `${label} notification`,
      body: "Test notification",
      release_id: releaseId,
    })
    .select("id")
    .single();
  if (notifErr) throw new Error(`Seed notifications: ${notifErr.message}`);

  // Email preferences
  const { data: ep, error: epErr } = await serviceClient
    .from("email_preferences")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("id")
    .single();
  if (epErr) throw new Error(`Seed email_preferences: ${epErr.message}`);

  // Integrations (dummy encrypted tokens)
  const { data: integ, error: integErr } = await serviceClient
    .from("integrations")
    .insert({
      user_id: userId,
      provider: "google_drive",
      access_token_enc: "rls-test-dummy-token",
      provider_email: `${label.toLowerCase()}@test.com`,
    })
    .select("id")
    .single();
  if (integErr) throw new Error(`Seed integrations: ${integErr.message}`);

  // Release expenses
  const { data: exp, error: expErr } = await serviceClient
    .from("release_expenses")
    .insert({
      release_id: releaseId,
      user_id: userId,
      description: `${label} expense`,
      amount: 100,
    })
    .select("id")
    .single();
  if (expErr) throw new Error(`Seed release_expenses: ${expErr.message}`);

  // Release time entries
  const { data: te, error: teErr } = await serviceClient
    .from("release_time_entries")
    .insert({
      release_id: releaseId,
      user_id: userId,
      hours: 2,
      description: `${label} time entry`,
    })
    .select("id")
    .single();
  if (teErr) throw new Error(`Seed release_time_entries: ${teErr.message}`);

  // Conversion jobs
  const { data: cj, error: cjErr } = await serviceClient
    .from("conversion_jobs")
    .insert({
      audio_version_id: audioVersionIds[0],
      track_id: trackIds[0],
      source_format: "wav",
      target_format: "mp3",
      requested_by: userId,
    })
    .select("id")
    .single();
  if (cjErr) throw new Error(`Seed conversion_jobs: ${cjErr.message}`);

  // Artist photos
  const { data: ap, error: apErr } = await serviceClient
    .from("artist_photos")
    .insert({
      user_id: userId,
      artist_name_key: `${label.toLowerCase()}-artist`,
      photo_url: `https://example.com/${label}-photo.jpg`,
    })
    .select("id")
    .single();
  if (apErr) throw new Error(`Seed artist_photos: ${apErr.message}`);

  // Release members (invite a dummy email)
  const { data: rm, error: rmErr } = await serviceClient
    .from("release_members")
    .insert({
      release_id: releaseId,
      invited_email: `${label.toLowerCase()}-collaborator@test.com`,
      role: "collaborator",
    })
    .select("id")
    .single();
  if (rmErr) throw new Error(`Seed release_members: ${rmErr.message}`);

  return {
    releaseId,
    trackIds,
    trackIntentIds,
    trackSpecIds,
    trackElementIds,
    revisionNoteIds,
    mixReferenceId: mixRef!.id,
    audioVersionIds,
    briefShareId: briefShare!.id,
    portalTrackSettingId: pts!.id,
    portalVersionSettingId: pvs!.id,
    trackDistributionIds,
    trackSplitIds,
    userDefaultsId: ud!.id,
    savedContactId: sc!.id,
    notificationId: notif!.id,
    emailPreferencesId: ep!.id,
    integrationId: integ!.id,
    releaseExpenseId: exp!.id,
    releaseTimeEntryId: te!.id,
    conversionJobId: cj!.id,
    artistPhotoId: ap!.id,
    releaseMemberId: rm!.id,
  };
}

// ── Setup ────────────────────────────────────────────────────────

export async function setup(): Promise<TestContext> {
  console.log("\n── Setting up RLS audit ──────────────────────────");

  const serviceClient = createServiceClient();
  const anonClient = createAnonClient();

  // Create test users
  console.log("  Creating test users...");
  const { client: clientA, userId: userAId } =
    await createAuthenticatedClient(USER_A_EMAIL, USER_A_PASS);
  const { client: clientB, userId: userBId } =
    await createAuthenticatedClient(USER_B_EMAIL, USER_B_PASS);

  console.log(`  User A: ${userAId}`);
  console.log(`  User B: ${userBId}`);

  // Seed data
  console.log("  Seeding data for User A...");
  const seedA = await seedUser(serviceClient, userAId, "UserA");

  console.log("  Seeding data for User B...");
  const seedB = await seedUser(serviceClient, userBId, "UserB");

  console.log("  Setup complete.\n");

  return {
    userA: { id: userAId, email: USER_A_EMAIL, client: clientA },
    userB: { id: userBId, email: USER_B_EMAIL, client: clientB },
    seedA,
    seedB,
    serviceClient,
    anonClient,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────

export async function cleanup(ctx: TestContext): Promise<void> {
  console.log("\n── Cleaning up RLS audit ─────────────────────────");
  const { serviceClient, userA, userB, seedA, seedB } = ctx;

  for (const [label, seed, userId] of [
    ["User A", seedA, userA.id],
    ["User B", seedB, userB.id],
  ] as const) {
    console.log(`  Cleaning ${label} data...`);

    // Delete in reverse dependency order
    await serviceClient.from("portal_version_settings").delete().eq("id", seed.portalVersionSettingId);
    await serviceClient.from("portal_track_settings").delete().eq("id", seed.portalTrackSettingId);
    await serviceClient.from("conversion_jobs").delete().eq("id", seed.conversionJobId);
    await serviceClient.from("release_time_entries").delete().eq("id", seed.releaseTimeEntryId);
    await serviceClient.from("release_expenses").delete().eq("id", seed.releaseExpenseId);
    await serviceClient.from("integration_sync_log").delete().eq("integration_id", seed.integrationId);
    await serviceClient.from("integrations").delete().eq("id", seed.integrationId);
    await serviceClient.from("email_preferences").delete().eq("user_id", userId);
    await serviceClient.from("notifications").delete().eq("id", seed.notificationId);
    await serviceClient.from("saved_contacts").delete().eq("id", seed.savedContactId);
    await serviceClient.from("artist_photos").delete().eq("id", seed.artistPhotoId);
    await serviceClient.from("release_members").delete().eq("id", seed.releaseMemberId);
    await serviceClient.from("brief_shares").delete().eq("id", seed.briefShareId);
    for (const sid of seed.trackSplitIds) {
      await serviceClient.from("track_splits").delete().eq("id", sid);
    }
    for (const did of seed.trackDistributionIds) {
      await serviceClient.from("track_distribution").delete().eq("id", did);
    }
    await serviceClient.from("mix_references").delete().eq("id", seed.mixReferenceId);
    for (const nid of seed.revisionNoteIds) {
      await serviceClient.from("revision_notes").delete().eq("id", nid);
    }
    for (const vid of seed.audioVersionIds) {
      await serviceClient.from("track_audio_versions").delete().eq("id", vid);
    }
    for (const eid of seed.trackElementIds) {
      await serviceClient.from("track_elements").delete().eq("id", eid);
    }
    for (const sid of seed.trackSpecIds) {
      await serviceClient.from("track_specs").delete().eq("id", sid);
    }
    for (const iid of seed.trackIntentIds) {
      await serviceClient.from("track_intent").delete().eq("id", iid);
    }
    for (const tid of seed.trackIds) {
      await serviceClient.from("tracks").delete().eq("id", tid);
    }
    await serviceClient.from("user_defaults").delete().eq("user_id", userId);
    await serviceClient.from("releases").delete().eq("id", seed.releaseId);
  }

  // Delete storage test files if any (sanitize UUIDs to prevent path traversal)
  const safeA = userA.id.replace(/[^a-f0-9\-]/gi, "");
  const safeB = userB.id.replace(/[^a-f0-9\-]/gi, "");
  await serviceClient.storage
    .from("cover-art")
    .remove([
      `${safeA}/rls-test-file.txt`,
      `${safeB}/rls-test-file.txt`,
    ]);

  // Delete test auth users
  console.log("  Deleting test auth users...");
  await serviceClient.auth.admin.deleteUser(userA.id);
  await serviceClient.auth.admin.deleteUser(userB.id);

  console.log("  Cleanup complete.\n");
}
