import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { triggerScanByName, isAikidoConfigured } from "@/lib/aikido";

const REPO_NAME = "mix-architect";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-aikido-scan:${ip}`, 1, 600_000);
  if (!success) {
    return NextResponse.json(
      { error: "Scan already triggered. Wait 10 minutes between scans." },
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
      { error: "Aikido credentials not configured." },
      { status: 503 },
    );
  }

  try {
    const repoId = await triggerScanByName(REPO_NAME);

    if (repoId === null) {
      return NextResponse.json(
        { error: `Repository "${REPO_NAME}" not found in Aikido.` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      repoId,
      message: "Scan triggered. Results will appear once Aikido completes the scan.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to trigger scan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
