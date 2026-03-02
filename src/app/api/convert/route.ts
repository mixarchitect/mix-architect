import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isConvertible } from "@/lib/conversion-formats";

/**
 * POST /api/convert
 * Create a single-format conversion job.
 *
 * Request body: { audioVersionId: string, trackId: string, targetFormat: string }
 *
 * Returns:
 *   - Cached:     { jobId, status: "completed", outputUrl }
 *   - In flight:  { jobId, status: "pending" | "processing" }
 *   - New:        { jobId, status: "pending" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioVersionId, trackId, targetFormat } = body as {
      audioVersionId: string;
      trackId: string;
      targetFormat: string;
    };

    if (!audioVersionId || !trackId || !targetFormat) {
      return NextResponse.json(
        { error: "Missing required fields: audioVersionId, trackId, targetFormat" },
        { status: 400 },
      );
    }

    const normalizedFormat = targetFormat.toLowerCase();

    if (!isConvertible(targetFormat)) {
      return NextResponse.json(
        { error: `Format "${targetFormat}" is not convertible` },
        { status: 400 },
      );
    }

    // Authenticate
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for a cached completed conversion that hasn't expired
    const { data: cached } = await supabase
      .from("conversion_jobs")
      .select("id, status, output_url")
      .eq("audio_version_id", audioVersionId)
      .eq("target_format", normalizedFormat)
      .eq("status", "completed")
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({
        jobId: cached.id,
        status: "completed",
        outputUrl: cached.output_url,
      });
    }

    // Check for an already-pending or processing job
    const { data: inFlight } = await supabase
      .from("conversion_jobs")
      .select("id, status")
      .eq("audio_version_id", audioVersionId)
      .eq("target_format", normalizedFormat)
      .in("status", ["pending", "processing"])
      .limit(1)
      .maybeSingle();

    if (inFlight) {
      return NextResponse.json({
        jobId: inFlight.id,
        status: inFlight.status,
      });
    }

    // Detect source format from the audio version
    const { data: version } = await supabase
      .from("track_audio_versions")
      .select("file_format, file_name")
      .eq("id", audioVersionId)
      .single();

    if (!version) {
      return NextResponse.json(
        { error: "Audio version not found" },
        { status: 404 },
      );
    }

    // Use file_format (from migration 019) or fall back to file extension
    const sourceFormat =
      version.file_format?.toLowerCase() ??
      version.file_name?.split(".").pop()?.toLowerCase() ??
      "wav";

    // Create the job
    const { data: job, error } = await supabase
      .from("conversion_jobs")
      .insert({
        audio_version_id: audioVersionId,
        track_id: trackId,
        source_format: sourceFormat,
        target_format: normalizedFormat,
        requested_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[convert] insert failed:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ jobId: job.id, status: "pending" });
  } catch (err) {
    console.error("[convert] unhandled error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    );
  }
}
