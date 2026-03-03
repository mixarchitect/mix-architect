import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import archiver from "archiver";

/**
 * GET /api/export
 * Streams a zip of the user's complete account data:
 *   metadata.json, payments.csv (if enabled), and audio files.
 *
 * GET /api/export?estimate=true
 * Returns estimated export size without downloading.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient({
      allowCookieWrite: true,
    });
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isEstimate = req.nextUrl.searchParams.get("estimate") === "true";

    /* -------------------------------------------------------------- */
    /*  Fetch all owned releases                                       */
    /* -------------------------------------------------------------- */

    const { data: releases } = await supabase
      .from("releases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const releaseIds = (releases ?? []).map((r) => r.id);

    /* -------------------------------------------------------------- */
    /*  Fetch all tracks                                               */
    /* -------------------------------------------------------------- */

    const { data: tracks } =
      releaseIds.length > 0
        ? await supabase
            .from("tracks")
            .select("*")
            .in("release_id", releaseIds)
            .order("track_number")
        : { data: [] as any[] };

    const trackIds = (tracks ?? []).map((t) => t.id);

    /* -------------------------------------------------------------- */
    /*  Estimate mode: return size info without streaming              */
    /* -------------------------------------------------------------- */

    if (isEstimate) {
      const { data: audioVersions } =
        trackIds.length > 0
          ? await supabase
              .from("track_audio_versions")
              .select("file_size")
              .in("track_id", trackIds)
          : { data: [] };

      const audioBytes = (audioVersions ?? []).reduce(
        (sum, av) => sum + (av.file_size ?? 0),
        0
      );
      // Add ~50KB overhead for metadata.json + payments.csv
      const estimatedBytes = audioBytes + 50_000;

      return NextResponse.json({
        estimatedBytes,
        releaseCount: releaseIds.length,
        trackCount: trackIds.length,
        audioFileCount: (audioVersions ?? []).length,
      });
    }

    /* -------------------------------------------------------------- */
    /*  Batch-fetch all related tables in parallel                     */
    /* -------------------------------------------------------------- */

    const [
      intentRes,
      specsRes,
      refsRes,
      audioRes,
      notesRes,
      distRes,
      splitsRes,
      membersRes,
      briefSharesRes,
      templatesRes,
      defaultsRes,
    ] = await Promise.all([
      trackIds.length > 0
        ? supabase.from("track_intent").select("*").in("track_id", trackIds)
        : { data: [] },
      trackIds.length > 0
        ? supabase.from("track_specs").select("*").in("track_id", trackIds)
        : { data: [] },
      releaseIds.length > 0
        ? supabase
            .from("mix_references")
            .select("*")
            .or(
              releaseIds
                .map((id) => `release_id.eq.${id}`)
                .concat(trackIds.map((id) => `track_id.eq.${id}`))
                .join(",")
            )
            .order("sort_order")
        : { data: [] },
      trackIds.length > 0
        ? supabase
            .from("track_audio_versions")
            .select("*")
            .in("track_id", trackIds)
            .order("version_number")
        : { data: [] },
      trackIds.length > 0
        ? supabase
            .from("revision_notes")
            .select("*")
            .in("track_id", trackIds)
            .order("created_at")
        : { data: [] },
      trackIds.length > 0
        ? supabase
            .from("track_distribution")
            .select("*")
            .in("track_id", trackIds)
        : { data: [] },
      trackIds.length > 0
        ? supabase
            .from("track_splits")
            .select("*")
            .in("track_id", trackIds)
            .order("sort_order")
        : { data: [] },
      releaseIds.length > 0
        ? supabase
            .from("release_members")
            .select("*")
            .in("release_id", releaseIds)
        : { data: [] },
      releaseIds.length > 0
        ? supabase
            .from("brief_shares")
            .select("*")
            .in("release_id", releaseIds)
        : { data: [] },
      supabase
        .from("release_templates")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("user_defaults")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    /* -------------------------------------------------------------- */
    /*  Fetch portal sub-tables if brief shares exist                  */
    /* -------------------------------------------------------------- */

    const briefShares = briefSharesRes.data ?? [];
    const briefShareIds = briefShares.map((bs) => bs.id);

    let portalSettings: any[] = [];
    let portalEvents: any[] = [];

    if (briefShareIds.length > 0) {
      const [psRes, peRes] = await Promise.all([
        supabase
          .from("portal_track_settings")
          .select("*")
          .in("brief_share_id", briefShareIds),
        supabase
          .from("portal_approval_events")
          .select("*")
          .in("brief_share_id", briefShareIds)
          .order("created_at"),
      ]);
      portalSettings = psRes.data ?? [];
      portalEvents = peRes.data ?? [];
    }

    /* -------------------------------------------------------------- */
    /*  Assemble metadata.json                                         */
    /* -------------------------------------------------------------- */

    const metadata = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.user_metadata?.display_name ?? null,
      },
      defaults: defaultsRes.data ?? null,
      templates: templatesRes.data ?? [],
      releases: (releases ?? []).map((release) => {
        const relTracks = (tracks ?? []).filter(
          (t) => t.release_id === release.id
        );
        const relMembers = (membersRes.data ?? []).filter(
          (m) => m.release_id === release.id
        );
        const relBriefShare = briefShares.find(
          (bs) => bs.release_id === release.id
        );
        const globalRefs = (refsRes.data ?? []).filter(
          (r) => r.release_id === release.id && !r.track_id
        );

        return {
          ...release,
          members: relMembers,
          globalReferences: globalRefs,
          briefShare: relBriefShare ?? null,
          portalSettings: relBriefShare
            ? portalSettings.filter(
                (ps) => ps.brief_share_id === relBriefShare.id
              )
            : [],
          portalApprovalEvents: relBriefShare
            ? portalEvents.filter(
                (pe) => pe.brief_share_id === relBriefShare.id
              )
            : [],
          tracks: relTracks.map((track) => ({
            ...track,
            intent:
              (intentRes.data ?? []).find((i) => i.track_id === track.id) ??
              null,
            specs:
              (specsRes.data ?? []).find((s) => s.track_id === track.id) ??
              null,
            references: (refsRes.data ?? []).filter(
              (r) => r.track_id === track.id
            ),
            audioVersions: (audioRes.data ?? []).filter(
              (a) => a.track_id === track.id
            ),
            comments: (notesRes.data ?? []).filter(
              (n) => n.track_id === track.id
            ),
            distribution:
              (distRes.data ?? []).find((d) => d.track_id === track.id) ?? null,
            splits: (splitsRes.data ?? []).filter(
              (s) => s.track_id === track.id
            ),
          })),
        };
      }),
    };

    /* -------------------------------------------------------------- */
    /*  Build payments CSV if enabled                                   */
    /* -------------------------------------------------------------- */

    const paymentsEnabled = defaultsRes.data?.payments_enabled ?? false;
    let paymentsCsv: string | null = null;

    if (paymentsEnabled) {
      const rows: string[] = [
        "Release,Artist,Track,Track Fee,Track Paid,Release Fee Total,Currency,Payment Status,Paid Amount",
      ];

      for (const release of releases ?? []) {
        const relTracks = (tracks ?? []).filter(
          (t) => t.release_id === release.id
        );
        if (relTracks.length === 0) {
          rows.push(
            csvRow([
              release.title,
              release.artist ?? "",
              "",
              "",
              "",
              String(release.fee_total ?? 0),
              release.fee_currency ?? "USD",
              release.payment_status ?? "",
              String(release.paid_amount ?? 0),
            ])
          );
        } else {
          for (const track of relTracks) {
            rows.push(
              csvRow([
                release.title,
                release.artist ?? "",
                track.title,
                String(track.fee ?? ""),
                track.fee_paid ? "Yes" : "No",
                String(release.fee_total ?? 0),
                release.fee_currency ?? "USD",
                release.payment_status ?? "",
                String(release.paid_amount ?? 0),
              ])
            );
          }
        }
      }

      paymentsCsv = rows.join("\n");
    }

    /* -------------------------------------------------------------- */
    /*  Assemble zip via archiver                                      */
    /* -------------------------------------------------------------- */

    const archive = archiver("zip", { zlib: { level: 1 } });

    archive.append(JSON.stringify(metadata, null, 2), {
      name: "mix-architect-export/metadata.json",
    });

    if (paymentsCsv) {
      archive.append(paymentsCsv, {
        name: "mix-architect-export/payments.csv",
      });
    }

    // Append audio files sequentially to bound memory
    const audioVersions = audioRes.data ?? [];
    for (const av of audioVersions) {
      if (!av.audio_url) continue;

      const track = (tracks ?? []).find((t) => t.id === av.track_id);
      if (!track) continue;
      const release = (releases ?? []).find(
        (r) => r.id === track.release_id
      );
      if (!release) continue;

      const relDir = sanitizeFilename(release.title || "Untitled Release");
      const trackDir = sanitizeFilename(
        `${String(track.track_number).padStart(2, "0")}-${track.title || "Untitled"}`
      );
      const originalName = av.file_name
        ? sanitizeFilename(av.file_name)
        : `v${av.version_number}.wav`;
      const fileName = `v${av.version_number}-${originalName}`;

      try {
        const audioFetch = await fetch(av.audio_url);
        if (audioFetch.ok && audioFetch.body) {
          const nodeStream = Readable.fromWeb(
            audioFetch.body as import("stream/web").ReadableStream
          );
          archive.append(nodeStream, {
            name: `mix-architect-export/releases/${relDir}/tracks/${trackDir}/${fileName}`,
          });
        }
      } catch (err) {
        console.error(`[export] failed to fetch audio ${av.audio_url}:`, err);
      }
    }

    archive.finalize();

    /* -------------------------------------------------------------- */
    /*  Stream response                                                */
    /* -------------------------------------------------------------- */

    const nodeStream = archive as unknown as NodeJS.ReadableStream;
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer) =>
          controller.enqueue(new Uint8Array(chunk))
        );
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    return new Response(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="mix-architect-export-${timestamp}.zip"`,
      },
    });
  } catch (err) {
    console.error("[export] error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

import { Readable } from "stream";

function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100) || "Untitled"
  );
}

function csvRow(fields: string[]): string {
  return fields
    .map((f) => {
      if (f.includes(",") || f.includes('"') || f.includes("\n")) {
        return `"${f.replace(/"/g, '""')}"`;
      }
      return f;
    })
    .join(",");
}
