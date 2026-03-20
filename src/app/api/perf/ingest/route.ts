import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/** Shape of a single metric sent from the client. */
interface PerfMetricPayload {
  sessionId: string;
  metric: string;
  durationMs: number;
  trackId?: string;
  versionId?: string;
  fileFormat?: string;
  fileSizeMb?: number;
  durationSec?: number;
  sampleRate?: number;
  bitDepth?: number;
  channels?: number;
  avgFps?: number;
  minFps?: number;
  p5Fps?: number;
  droppedFrames?: number;
  jankFrames?: number;
  deviceType?: string;
}

const MAX_BATCH = 50;

/**
 * POST /api/perf/ingest
 * Accepts a batch of perf metrics from the client and inserts them.
 * Authenticated — user must be logged in.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`perf-ingest:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    // Authenticate the caller
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const metrics = body.metrics as PerfMetricPayload[] | undefined;

    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json({ error: "No metrics provided" }, { status: 400 });
    }

    if (metrics.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Batch too large (max ${MAX_BATCH})` },
        { status: 400 },
      );
    }

    const userAgent = req.headers.get("user-agent") ?? undefined;

    const rows = metrics.map((m) => ({
      user_id: user.id,
      session_id: m.sessionId,
      metric: m.metric,
      duration_ms: m.durationMs,
      track_id: m.trackId ?? null,
      version_id: m.versionId ?? null,
      file_format: m.fileFormat ?? null,
      file_size_mb: m.fileSizeMb ?? null,
      duration_sec: m.durationSec ?? null,
      sample_rate: m.sampleRate ?? null,
      bit_depth: m.bitDepth ?? null,
      channels: m.channels ?? null,
      avg_fps: m.avgFps ?? null,
      min_fps: m.minFps ?? null,
      p5_fps: m.p5Fps ?? null,
      dropped_frames: m.droppedFrames ?? null,
      jank_frames: m.jankFrames ?? null,
      user_agent: userAgent ?? null,
      device_type: m.deviceType ?? null,
    }));

    // Use service client to bypass RLS for insert (avoids needing user's session)
    const svc = createSupabaseServiceClient();
    const { error } = await svc.from("perf_metrics").insert(rows);

    if (error) {
      console.error("[perf/ingest] Insert failed:", error.message);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
