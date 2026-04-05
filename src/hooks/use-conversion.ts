"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { getFormatExtension } from "@/lib/conversion-formats";
import { trackGA4Event } from "@/lib/ga4-track";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ConversionStatus =
  | "idle"
  | "requesting"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type EmbeddedMetadata = Record<string, string | boolean>;

export type ConversionJob = {
  jobId: string;
  status: ConversionStatus;
  outputUrl: string | null;
  errorMessage: string | null;
  targetFormat: string;
  embeddedMetadata: EmbeddedMetadata | null;
};

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

const POLL_INTERVAL = 3_000; // 3 seconds

/**
 * Manages audio format conversion lifecycle:
 * request → poll for status → auto-download on completion.
 */
export function useConversion() {
  const [jobs, setJobs] = useState<Map<string, ConversionJob>>(new Map());
  const pollTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );
  const { toast } = useToast();

  // Cleanup all poll timers on unmount
  useEffect(() => {
    return () => {
      pollTimers.current.forEach((timer) => clearInterval(timer));
    };
  }, []);

  // ── Download helper (fetch + blob, same pattern as audio-player.tsx) ──

  const triggerDownload = useCallback(
    (url: string, fileName: string, targetFormat: string) => {
      const ext = getFormatExtension(targetFormat);
      const baseName = fileName.replace(/\.[^.]+$/, "");
      const downloadName = `${baseName}.${ext}`;

      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = downloadName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          // Fallback: open in a new tab
          window.open(url, "_blank");
        });
    },
    [],
  );

  // ── Poll a job until it completes or fails ────────────────────────

  const startPolling = useCallback(
    (
      key: string,
      jobId: string,
      fileName: string,
      targetFormat: string,
      versionNumber?: number,
    ) => {
      // Clear any existing poll for this key
      const existing = pollTimers.current.get(key);
      if (existing) clearInterval(existing);

      const vLabel = versionNumber ? ` (v${versionNumber})` : "";

      const timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/convert/${jobId}`);
          if (!res.ok) return; // Network issue — keep polling

          const data = await res.json();

          setJobs((prev) => {
            const next = new Map(prev);
            next.set(key, {
              jobId,
              status: data.status,
              outputUrl: data.output_url ?? null,
              errorMessage: data.error_message ?? null,
              targetFormat,
              embeddedMetadata: data.embedded_metadata ?? null,
            });
            return next;
          });

          if (data.status === "completed") {
            clearInterval(timer);
            pollTimers.current.delete(key);

            if (data.output_url) {
              triggerDownload(data.output_url, fileName, targetFormat);
            }

            toast(`${targetFormat.toUpperCase()} export ready${vLabel}`, {
              variant: "success",
            });
          } else if (data.status === "failed") {
            clearInterval(timer);
            pollTimers.current.delete(key);

            toast(data.error_message || "Conversion failed", {
              variant: "error",
            });
          }
        } catch {
          // Network error — keep polling
        }
      }, POLL_INTERVAL);

      pollTimers.current.set(key, timer);
    },
    [toast, triggerDownload],
  );

  // ── Request a conversion ──────────────────────────────────────────

  const requestConversion = useCallback(
    async (
      audioVersionId: string,
      trackId: string,
      targetFormat: string,
      fileName: string,
      versionNumber?: number,
    ) => {
      const key = `${audioVersionId}:${targetFormat.toLowerCase()}`;

      // Don't re-request if already in progress
      const current = jobs.get(key);
      if (
        current &&
        (current.status === "requesting" ||
          current.status === "pending" ||
          current.status === "processing")
      ) {
        return;
      }

      setJobs((prev) => {
        const next = new Map(prev);
        next.set(key, {
          jobId: "",
          status: "requesting",
          outputUrl: null,
          errorMessage: null,
          targetFormat: targetFormat.toLowerCase(),
          embeddedMetadata: null,
        });
        return next;
      });

      try {
        const res = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioVersionId,
            trackId,
            targetFormat: targetFormat.toLowerCase(),
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Request failed");
        trackGA4Event("converter_use", { to_format: targetFormat.toLowerCase() });

        if (data.status === "completed" && data.outputUrl) {
          // Cache hit — download immediately
          setJobs((prev) => {
            const next = new Map(prev);
            next.set(key, {
              jobId: data.jobId,
              status: "completed",
              outputUrl: data.outputUrl,
              errorMessage: null,
              targetFormat: targetFormat.toLowerCase(),
              embeddedMetadata: null,
            });
            return next;
          });
          triggerDownload(data.outputUrl, fileName, targetFormat);
          const vLabel = versionNumber ? ` (v${versionNumber})` : "";
          toast(`${targetFormat.toUpperCase()} export ready${vLabel}`, {
            variant: "success",
          });
          return;
        }

        // Job created or already in flight — start polling
        setJobs((prev) => {
          const next = new Map(prev);
          next.set(key, {
            jobId: data.jobId,
            status: data.status,
            outputUrl: null,
            errorMessage: null,
            targetFormat: targetFormat.toLowerCase(),
            embeddedMetadata: null,
          });
          return next;
        });

        startPolling(key, data.jobId, fileName, targetFormat, versionNumber);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Conversion failed";

        setJobs((prev) => {
          const next = new Map(prev);
          next.set(key, {
            jobId: "",
            status: "failed",
            outputUrl: null,
            errorMessage: msg,
            targetFormat: targetFormat.toLowerCase(),
            embeddedMetadata: null,
          });
          return next;
        });

        toast(msg, { variant: "error" });
      }
    },
    [jobs, toast, triggerDownload, startPolling],
  );

  // ── Get the status for a specific version + format ────────────────

  const getJobStatus = useCallback(
    (
      audioVersionId: string,
      targetFormat: string,
    ): ConversionJob | null => {
      return (
        jobs.get(`${audioVersionId}:${targetFormat.toLowerCase()}`) ?? null
      );
    },
    [jobs],
  );

  return { requestConversion, getJobStatus, jobs };
}
