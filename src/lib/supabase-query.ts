import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

/**
 * Wraps a Supabase query with consistent error handling.
 * - Returns data on success
 * - Calls notFound() if no rows returned (for single-record fetches)
 * - Redirects to sign-in on auth errors
 * - Throws for unexpected errors (caught by error.tsx boundary)
 */
export async function queryOrNotFound<T>(
  query: PromiseLike<{ data: T | null; error: { code?: string; message?: string } | null }>,
): Promise<T> {
  const { data, error } = await query;

  if (error) {
    // Row-level security violation or not found
    if (error.code === "PGRST116" || error.code === "42501") {
      notFound();
    }
    // Auth / JWT expiry
    if (error.message?.includes("JWT")) {
      redirect("/auth/sign-in");
    }
    // Unexpected — throw so error.tsx catches it
    throw new Error(`Database error: ${error.message}`);
  }

  if (data === null) {
    notFound();
  }

  return data;
}

/**
 * Wraps a Supabase query that may return null (optional data).
 * Returns data or null — never throws or calls notFound().
 * Use for optional/secondary queries where missing data is fine.
 */
export async function queryOrNull<T>(
  query: PromiseLike<{ data: T | null; error: { message?: string } | null }>,
): Promise<T | null> {
  const { data, error } = await query;

  if (error) {
    console.error("[queryOrNull]", error.message);
    return null;
  }

  return data;
}
