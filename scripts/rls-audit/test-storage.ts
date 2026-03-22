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
  const testFilePath = `${userA.id}/rls-test-file.txt`;
  const testContent = Buffer.from("RLS audit test file content");

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

  // Test: User B cannot download User A's file
  const { data: downloadData, error: downloadErr } = await userB.client.storage
    .from(bucket)
    .download(testFilePath);
  const downloadBlocked = !!downloadErr || !downloadData;
  recordResult(
    "storage: B cannot download A's file",
    downloadBlocked,
    downloadBlocked ? undefined : "B downloaded A's file",
  );

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
    .upload(`${userA.id}/injected-by-b.txt`, Buffer.from("malicious"), {
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
      .remove([`${userA.id}/injected-by-b.txt`]);
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
