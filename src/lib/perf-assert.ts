/* ------------------------------------------------------------------ */
/*  Performance budget assertion — for CI/dev validation              */
/* ------------------------------------------------------------------ */

import type { PerfMark } from "./perf";
import { PERF_BUDGETS, toBudgetArray } from "./perf-budgets";

export interface PerfAssertionResult {
  passed: boolean;
  metric: string;
  actual: number;
  budget: number;
  /** Percentage over budget (0 if under) */
  overage: number;
}

/**
 * Compare completed perf marks against budgets.
 * Returns a pass/fail result for each budget that has matching marks.
 */
export function assertBudgets(
  marks: PerfMark[],
  _budgets?: typeof PERF_BUDGETS,
): PerfAssertionResult[] {
  const budgetArray = toBudgetArray();
  const results: PerfAssertionResult[] = [];

  for (const b of budgetArray) {
    const matching = marks.filter((m) => m.name === b.metric);
    if (matching.length === 0) continue;

    const worst = Math.max(...matching.map((m) => m.duration ?? 0));
    const passed = worst <= b.budget;
    const overage = passed
      ? 0
      : Math.round(((worst - b.budget) / b.budget) * 100);

    results.push({
      passed,
      metric: b.metric,
      actual: Math.round(worst * 100) / 100,
      budget: b.budget,
      overage,
    });
  }

  return results;
}

/** Print a formatted budget report to the console. */
export function printBudgetReport(results: PerfAssertionResult[]): void {
  if (results.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No budget results to report.");
    return;
  }

  const rows = results.map((r) => ({
    metric: r.metric,
    budget: `${r.budget}ms`,
    actual: `${r.actual}ms`,
    status: r.passed ? "PASS" : "FAIL",
    overage: r.overage > 0 ? `+${r.overage}%` : "—",
  }));

  // eslint-disable-next-line no-console
  console.table(rows);

  const passing = results.filter((r) => r.passed).length;
  const total = results.length;
  const score = Math.round((passing / total) * 100);

  // eslint-disable-next-line no-console
  console.log(
    `\nPerformance score: ${score}% (${passing}/${total} budgets passing)`,
  );

  const worst = results
    .filter((r) => !r.passed)
    .sort((a, b) => b.overage - a.overage)[0];
  if (worst) {
    // eslint-disable-next-line no-console
    console.log(
      `Worst offender: ${worst.metric} — ${worst.actual}ms vs ${worst.budget}ms budget (+${worst.overage}%)`,
    );
  }
}
