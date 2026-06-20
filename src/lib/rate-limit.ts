import { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

/**
 * Two rate limiters live here:
 *
 *   rateLimit()    — in-memory, per-Vercel-Lambda. Cheap; fine for
 *                    noisy endpoints (webhooks, client telemetry) where
 *                    per-container caps are good enough.
 *
 *   dbRateLimit()  — Postgres-backed, shared across all containers.
 *                    Use for sensitive admin actions whose limits MUST
 *                    actually hold (delete-user, bulk-comp, etc.). Backed
 *                    by the `consume_rate_limit` function in migration
 *                    058 — one round trip, atomic check-and-consume.
 *
 * Don't migrate everything to dbRateLimit — every call is a DB round
 * trip, and for endpoints where worst-case fan-out is acceptable the
 * in-memory limiter is cheaper.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
let lastPrune = Date.now();

function pruneStale() {
  const now = Date.now();
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  pruneStale();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - entry.count };
}

/**
 * Shared rate limiter backed by Postgres. Holds across cold starts and
 * across Vercel containers. Cost: one round trip to the database per
 * call. Use for admin endpoints whose limits would otherwise be
 * trivially defeated by container fan-out.
 *
 * Fails OPEN on a DB error (returns success: true) — a transient DB
 * blip shouldn't lock legitimate admins out of cancel/delete flows.
 * The blast radius of fail-open is bounded by the admin gate that runs
 * after this check.
 */
export async function dbRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number }> {
  try {
    const svc = createSupabaseServiceClient();
    const { data, error } = await svc.rpc("consume_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });

    if (error) {
      console.error("[dbRateLimit] rpc error (failing open):", error.message);
      return { success: true, remaining: limit };
    }

    // Postgres functions returning TABLE come back as an array of rows.
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== "boolean") {
      console.error("[dbRateLimit] unexpected response shape (failing open):", data);
      return { success: true, remaining: limit };
    }

    return {
      success: row.allowed,
      remaining: typeof row.remaining === "number" ? row.remaining : 0,
    };
  } catch (err) {
    console.error("[dbRateLimit] threw (failing open):", err);
    return { success: true, remaining: limit };
  }
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
