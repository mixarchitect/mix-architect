import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  setup,
  cleanup,
  getResults,
  clearResults,
  type TestResult,
} from "../../../../../scripts/rls-audit/setup";
import { runIsolationTests } from "../../../../../scripts/rls-audit/test-isolation";
import { runAnonTests } from "../../../../../scripts/rls-audit/test-anon";
import { runStorageTests } from "../../../../../scripts/rls-audit/test-storage";

let auditInProgress = false;

export type RlsAuditResponse = {
  date: string;
  categories: {
    name: string;
    passed: number;
    total: number;
    results: TestResult[];
  }[];
  totalPassed: number;
  totalTests: number;
  failures: TestResult[];
};

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-rls-audit:${ip}`, 2, 300_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Wait 5 minutes between audits." },
      { status: 429 },
    );
  }

  // Auth check
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Prevent overlapping runs
  if (auditInProgress) {
    return NextResponse.json(
      { error: "An audit is already in progress. Please wait for it to complete." },
      { status: 409 },
    );
  }

  auditInProgress = true;

  try {
    clearResults();
    const ctx = await setup();

    const beforeIsolation = getResults().length;
    await runIsolationTests(ctx);
    const afterIsolation = getResults().length;

    const beforeAnon = afterIsolation;
    await runAnonTests(ctx);
    const afterAnon = getResults().length;

    const beforeStorage = afterAnon;
    await runStorageTests(ctx);
    const afterStorage = getResults().length;

    const all = getResults();

    const isolationResults = all.slice(beforeIsolation, afterIsolation);
    const anonResults = all.slice(beforeAnon, afterAnon);
    const storageResults = all.slice(beforeStorage, afterStorage);

    await cleanup(ctx);

    const response: RlsAuditResponse = {
      date: new Date().toISOString(),
      categories: [
        {
          name: "Data Isolation",
          passed: isolationResults.filter((r) => r.passed).length,
          total: isolationResults.length,
          results: isolationResults,
        },
        {
          name: "Anon & Edge Cases",
          passed: anonResults.filter((r) => r.passed).length,
          total: anonResults.length,
          results: anonResults,
        },
        {
          name: "Storage Isolation",
          passed: storageResults.filter((r) => r.passed).length,
          total: storageResults.length,
          results: storageResults,
        },
      ],
      totalPassed: all.filter((r) => r.passed).length,
      totalTests: all.length,
      failures: all.filter((r) => !r.passed),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error during audit";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    auditInProgress = false;
  }
}
