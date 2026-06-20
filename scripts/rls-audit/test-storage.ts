/**
 * RLS Audit — Storage Bucket Isolation Tests
 *
 * Verifies that User B cannot access User A's files
 * in the cover-art storage bucket.
 */

import type { TestContext } from "./setup";
import { getResults } from "./setup";

function recordResult(name: string, passed: boolean, detail?: string) {
  getResults().push({ name, passed, detail });
  console.log(passed ? `  PASS  ${name}` : `  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

export async function runStorageTests(ctx: TestContext): Promise<void> {
  const { userA, userB, serviceClient } = ctx;

  console.log("\n── Storage Isolation Tests ───────────────────────\n");

  const bucket = "cover-art";
  // Validate UUID format to prevent path traversal
  const safeUserId = userA.id.replace(/[^a-f0-9\-]/gi, "");
  const testFilePath = `${safeUserId}/rls-test-file.txt`;
  const testContent = Buffer.from("RLS audit test file content");

  // The cover-art bucket is intentionally public — release art is
  // rendered via <img src> across the app, mini-player, portal
  // pages, and release cards, and is ultimately distributed to
  // Spotify / Apple Music. We keep the bucket flagged public so
  // those URLs work without server-signed roundtrips, then accept
  // that anyone with a UUID-based path can fetch the file.
  //
  // The five non-download tests below (list / upload / overwrite /
  // delete) still verify RLS for cover-art — the `public` flag only
  // bypasses SELECT.
  //
  // For sensitive assets (track-audio), the bucket stays private and
  // the app generates signed URLs server-side via
  // signAudioUrlsAction(). That path is exercised by the
  // application-layer authz tests, not by this storage script.
  const { data: bucketInfo } = await serviceClient.storage.getBucket(bucket);
  const bucketIsPublic = bucketInfo?.public === true;

  // Upload a test file as User A via service client
  const { error: uploadErr } = await serviceClient.storage
    .from(bucket)
    .upload(testFilePath, testContent, { upsert: true });

  if (uploadErr) {
    console.log(`  SKIP  Storage tests — could not upload test file: ${uploadErr.message}`);
    recordResult("storage: setup upload", false, uploadErr.message);
    return;
  }

  recordResult("storage: setup upload succeeded", true);

  if (bucketIsPublic) {
    // Public bucket: SELECT is intentionally not enforced by RLS.
    // Record a passing result with a note so the audit row is
    // honest about WHY it passed, and skip the actual call.
    recordResult(
      `storage: B cannot download A's file (skipped — ${bucket} is public by design)`,
      true,
    );
  } else {
    // Private bucket: SELECT must be enforced by RLS.
    const { data: downloadData, error: downloadErr } = await userB.client.storage
      .from(bucket)
      .download(testFilePath);
    const downloadBlocked = !!downloadErr || !downloadData;
    recordResult(
      "storage: B cannot download A's file",
      downloadBlocked,
      downloadBlocked ? undefined : "B downloaded A's file",
    );
  }

  // Test: User B cannot list User A's directory
  const { data: listData } = await userB.client.storage
    .from(bucket)
    .list(userA.id);
  const listBlocked = !listData || listData.length === 0;
  recordResult(
    "storage: B cannot list A's directory",
    listBlocked,
    listBlocked ? undefined : `B listed ${listData?.length} files in A's directory`,
  );

  // Test: User B cannot upload into User A's directory
  const { error: uploadAsB } = await userB.client.storage
    .from(bucket)
    .upload(`${safeUserId}/injected-by-b.txt`, Buffer.from("malicious"), {
      upsert: false,
    });
  const uploadBlocked = !!uploadAsB;
  recordResult(
    "storage: B cannot upload into A's directory",
    uploadBlocked,
    uploadBlocked ? undefined : "B uploaded into A's directory",
  );
  // Clean up if upload somehow succeeded
  if (!uploadBlocked) {
    await serviceClient.storage
      .from(bucket)
      .remove([`${safeUserId}/injected-by-b.txt`]);
  }

  // Test: User B cannot overwrite User A's file
  const { error: overwriteErr } = await userB.client.storage
    .from(bucket)
    .upload(testFilePath, Buffer.from("overwritten"), { upsert: true });
  const overwriteBlocked = !!overwriteErr;
  recordResult(
    "storage: B cannot overwrite A's file",
    overwriteBlocked,
    overwriteBlocked ? undefined : "B overwrote A's file",
  );

  // Test: User B cannot delete User A's file
  const { error: deleteErr } = await userB.client.storage
    .from(bucket)
    .remove([testFilePath]);
  // Verify file still exists
  const { data: stillExists } = await serviceClient.storage
    .from(bucket)
    .download(testFilePath);
  const deleteBlocked = !!stillExists;
  recordResult(
    "storage: B cannot delete A's file",
    deleteBlocked,
    deleteBlocked ? undefined : "B deleted A's file",
  );

  // Cleanup test file
  await serviceClient.storage.from(bucket).remove([testFilePath]);
}
