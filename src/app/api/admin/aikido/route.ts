import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getIssueCounts,
  getOpenIssueGroups,
  isAikidoConfigured,
  type AikidoIssueCounts,
  type AikidoIssueGroup,
} from "@/lib/aikido";

export type AikidoFindingsResponse = {
  counts: AikidoIssueCounts;
  issues: AikidoIssueGroup[];
  fetchedAt: string;
};

const REPO_NAME = "mix-architect";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-aikido:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
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

  if (!isAikidoConfigured()) {
    return NextResponse.json(
      { error: "Aikido credentials not configured. Set AIKIDO_CLIENT_ID and AIKIDO_CLIENT_SECRET environment variables." },
      { status: 503 },
    );
  }

  try {
    const [counts, issues] = await Promise.all([
      getIssueCounts(REPO_NAME),
      getOpenIssueGroups(REPO_NAME),
    ]);

    const response: AikidoFindingsResponse = {
      counts,
      issues,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch Aikido data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
