/**
 * RLS Security Audit — Runner
 *
 * Orchestrates setup → tests → cleanup and outputs a summary report.
 *
 * Usage:
 *   npx tsx scripts/rls-audit/run-all.ts
 *   npm run rls-audit
 */

import { setup, cleanup, getResults, clearResults, type TestResult } from "./setup.js";
import { runIsolationTests } from "./test-isolation.js";
import { runAnonTests } from "./test-anon.js";
import { runStorageTests } from "./test-storage.js";

async function main() {
  console.log("========================================");
  console.log("RLS SECURITY AUDIT — Mix Architect");
  console.log("========================================");
  console.log(`Date: ${new Date().toISOString()}\n`);

  clearResults();

  let ctx;
  try {
    ctx = await setup();
  } catch (err) {
    console.error("\nFATAL: Setup failed:", err);
    process.exit(1);
  }

  try {
    // Track results per category
    const beforeIsolation = getResults().length;
    await runIsolationTests(ctx);
    const isolationCount = getResults().length - beforeIsolation;

    const beforeAnon = getResults().length;
    await runAnonTests(ctx);
    const anonCount = getResults().length - beforeAnon;

    const beforeStorage = getResults().length;
    await runStorageTests(ctx);
    const storageCount = getResults().length - beforeStorage;

    // Summary
    const all = getResults();
    const passed = all.filter((r) => r.passed).length;
    const failed = all.filter((r) => !r.passed).length;

    const isolationResults = all.slice(0, beforeIsolation + isolationCount);
    const anonResults = all.slice(
      beforeIsolation + isolationCount,
      beforeIsolation + isolationCount + anonCount,
    );
    const storageResults = all.slice(
      beforeIsolation + isolationCount + anonCount,
    );

    const isolationPassed = isolationResults.filter((r) => r.passed).length;
    const anonPassed = anonResults.filter((r) => r.passed).length;
    const storagePassed = storageResults.filter((r) => r.passed).length;

    console.log("\n========================================");
    console.log("RESULTS");
    console.log("========================================");
    console.log(
      `Data Isolation:     ${isolationPassed}/${isolationResults.length} passed`,
    );
    console.log(
      `Anon & Edge Cases:  ${anonPassed}/${anonResults.length} passed`,
    );
    console.log(
      `Storage Isolation:  ${storagePassed}/${storageResults.length} passed`,
    );
    console.log("----------------------------------------");

    if (failed === 0) {
      console.log(`TOTAL:              ${passed}/${all.length} passed  ✓ ALL CLEAR`);
    } else {
      console.log(`TOTAL:              ${passed}/${all.length} passed  ✗ ${failed} FAILURE(S)`);
      console.log("\nFAILURES:");
      for (const r of all.filter((r) => !r.passed)) {
        console.log(`  - ${r.name}${r.detail ? ` (${r.detail})` : ""}`);
      }
    }
    console.log("========================================\n");

    // Cleanup
    await cleanup(ctx);

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("\nFATAL: Test execution failed:", err);
    // Still try to clean up
    try {
      await cleanup(ctx);
    } catch {
      console.error("Cleanup also failed. Test users/data may be orphaned.");
    }
    process.exit(1);
  }
}

// Export for use as a module (admin API route)
export { main as runRlsAudit };
export type { TestResult };

main();
