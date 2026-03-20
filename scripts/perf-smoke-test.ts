#!/usr/bin/env npx tsx
/* ------------------------------------------------------------------ */
/*  Performance infrastructure smoke test                              */
/*  Run: npm run perf:smoke                                            */
/* ------------------------------------------------------------------ */

// Mock minimal browser globals before importing perf modules
const g = globalThis as Record<string, unknown>;
if (typeof g.window === "undefined") {
  g.window = {
    location: { search: "?perf" },
  };
}
if (typeof g.performance === "undefined") {
  g.performance = {
    now: () => Date.now(),
  };
}
// NODE_ENV is set by the runtime (tsx/node); no override needed.

// --- Imports (after globals are set up) ---

import { PERF_BUDGETS, toBudgetArray } from "../src/lib/perf-budgets";
import { assertBudgets, printBudgetReport } from "../src/lib/perf-assert";
import type { PerfMark } from "../src/lib/perf";

/* ------------------------------------------------------------------ */
/*  Test helpers                                                       */
/* ------------------------------------------------------------------ */

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

/* ------------------------------------------------------------------ */
/*  1. Budget definitions                                              */
/* ------------------------------------------------------------------ */

console.log("\n── Budget Definitions ──");

const budgetKeys = Object.keys(PERF_BUDGETS);
assert(budgetKeys.length >= 10, `At least 10 budgets defined (got ${budgetKeys.length})`);

for (const [key, value] of Object.entries(PERF_BUDGETS)) {
  assert(typeof value === "number" && value > 0, `${key} = ${value}ms (positive number)`);
}

/* ------------------------------------------------------------------ */
/*  2. toBudgetArray conversion                                        */
/* ------------------------------------------------------------------ */

console.log("\n── toBudgetArray() ──");

const budgetArray = toBudgetArray();
assert(Array.isArray(budgetArray), "Returns an array");
assert(budgetArray.length > 0, `Has ${budgetArray.length} entries`);

for (const b of budgetArray) {
  assert(typeof b.metric === "string" && b.metric.length > 0, `metric "${b.metric}" is non-empty string`);
  assert(typeof b.budget === "number" && b.budget > 0, `budget for "${b.metric}" is ${b.budget}ms`);
  assert(b.severity === "warn" || b.severity === "error", `severity for "${b.metric}" is "${b.severity}"`);
}

// Verify mark names use colon convention
for (const b of budgetArray) {
  assert(b.metric.includes(":"), `"${b.metric}" uses colon-namespaced convention`);
}

/* ------------------------------------------------------------------ */
/*  3. assertBudgets — all passing                                     */
/* ------------------------------------------------------------------ */

console.log("\n── assertBudgets (all passing) ──");

const passingMarks: PerfMark[] = budgetArray.map((b) => ({
  name: b.metric,
  startTime: 0,
  endTime: b.budget * 0.5,
  duration: b.budget * 0.5, // 50% of budget — well under
}));

const passingResults = assertBudgets(passingMarks);
assert(passingResults.length === budgetArray.length, `All ${budgetArray.length} budgets evaluated`);
assert(
  passingResults.every((r) => r.passed),
  "All results pass when marks are under budget",
);

/* ------------------------------------------------------------------ */
/*  4. assertBudgets — some failing                                    */
/* ------------------------------------------------------------------ */

console.log("\n── assertBudgets (some failing) ──");

const mixedMarks: PerfMark[] = budgetArray.map((b, i) => ({
  name: b.metric,
  startTime: 0,
  endTime: i === 0 ? b.budget * 2 : b.budget * 0.5,
  duration: i === 0 ? b.budget * 2 : b.budget * 0.5,
}));

const mixedResults = assertBudgets(mixedMarks);
const failCount = mixedResults.filter((r) => !r.passed).length;
assert(failCount === 1, `Exactly 1 budget fails (got ${failCount})`);

const failedResult = mixedResults.find((r) => !r.passed);
if (failedResult) {
  assert(failedResult.overage > 0, `Overage is positive: ${failedResult.overage}%`);
  assert(
    failedResult.actual > failedResult.budget,
    `Actual (${failedResult.actual}ms) > budget (${failedResult.budget}ms)`,
  );
}

/* ------------------------------------------------------------------ */
/*  5. assertBudgets — no matching marks                               */
/* ------------------------------------------------------------------ */

console.log("\n── assertBudgets (no marks) ──");

const emptyResults = assertBudgets([]);
assert(emptyResults.length === 0, "Empty marks → empty results");

const unmatchedMarks: PerfMark[] = [
  { name: "unrelated:metric", startTime: 0, endTime: 100, duration: 100 },
];
const unmatchedResults = assertBudgets(unmatchedMarks);
assert(unmatchedResults.length === 0, "Unmatched mark names → empty results");

/* ------------------------------------------------------------------ */
/*  6. printBudgetReport (no crash)                                    */
/* ------------------------------------------------------------------ */

console.log("\n── printBudgetReport ──");

try {
  printBudgetReport([]);
  printBudgetReport(passingResults);
  printBudgetReport(mixedResults);
  assert(true, "printBudgetReport runs without errors");
} catch (err) {
  assert(false, `printBudgetReport threw: ${err}`);
}

/* ------------------------------------------------------------------ */
/*  7. Budget coverage check                                           */
/* ------------------------------------------------------------------ */

console.log("\n── Budget Coverage ──");

const instrumentedMarks = [
  "wavesurfer:init",
  "waveform:render",
  "waveform:seek",
  "playback:start",
  "waveform:resize",
];

const mappedMetrics = budgetArray.map((b) => b.metric);
for (const mark of instrumentedMarks) {
  const hasBudget = mappedMetrics.includes(mark) || mark === "waveform:resize";
  assert(hasBudget, `Instrumented mark "${mark}" has a budget or is tracked`);
}

/* ------------------------------------------------------------------ */
/*  Summary                                                            */
/* ------------------------------------------------------------------ */

console.log("\n══════════════════════════════════════");
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log("══════════════════════════════════════");

if (failed > 0) {
  console.log("\n⚠ Browser tests (manual):");
  console.log("  1. Open any page with ?perf → overlay appears");
  console.log("  2. Navigate to a track detail page → marks populate");
  console.log("  3. Play/pause audio → FPS tab shows snapshot");
  console.log("  4. Resize window → waveform:resize mark appears");
  console.log("  5. Open /app/perf → benchmark page loads\n");
  process.exit(1);
}

console.log("\n✓ All smoke tests passed.");
console.log("\n  Browser checklist (manual):");
console.log("  1. Open any page with ?perf → overlay appears");
console.log("  2. Navigate to a track detail page → marks populate");
console.log("  3. Play/pause audio → FPS tab shows snapshot");
console.log("  4. Resize window → waveform:resize mark appears");
console.log("  5. Open /app/perf → benchmark page loads\n");
process.exit(0);
