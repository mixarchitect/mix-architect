import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit-logger";
import { logActivity } from "@/lib/activity-logger";
import { dbRateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";

/**
 * POST /api/admin/reset-account
 * Reset a user back to a first-run state.
 *
 * Their releases are PARKED (soft-deleted), not destroyed: onboarding gains a
 * step where the user chooses to bring them back or start fresh, and even
 * "start fresh" stays recoverable from admin. Sessions are revoked and a
 * password-reset email is sent, so the user must sign in again.
 *
 * Body: { userId: string }
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = await dbRateLimit(`admin-reset-account:${ip}`, 5, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body as { userId: string };

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 },
      );
    }

    // Resetting yourself would revoke the session you are using to do it.
    if (userId === user.id) {
      return NextResponse.json(
        { error: "You cannot reset your own account" },
        { status: 400 },
      );
    }

    const serviceClient = createSupabaseServiceClient();

    const { data: targetUser } = await serviceClient.auth.admin.getUserById(userId);
    const targetEmail = targetUser?.user?.email;
    if (!targetEmail) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // One timestamp for both the park and the reset marker, so the onboarding
    // step can restore exactly the releases THIS reset parked
    // (deleted_at >= account_reset_at) and never resurrect ones the user
    // deliberately discarded in an earlier reset.
    const resetAt = new Date().toISOString();

    // 1. Park the user's active releases. They stay in the database and are
    //    hidden app-wide (accessible_release_ids filters deleted_at).
    const { data: parked, error: parkErr } = await serviceClient
      .from("releases")
      .update({ deleted_at: resetAt })
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select("id");

    if (parkErr) {
      console.error("[admin/reset-account] failed to park releases:", parkErr);
      return NextResponse.json({ error: "Failed to reset account" }, { status: 500 });
    }
    const parkedCount = parked?.length ?? 0;

    // 2. Replay onboarding, and clear the first-run UI state that goes with it.
    //    account_reset_at is what makes onboarding show the restore-or-discard
    //    step; the step clears it when the user decides.
    const { error: defaultsErr } = await serviceClient
      .from("user_defaults")
      .upsert(
        {
          user_id: userId,
          onboarding_completed: false,
          account_reset_at: resetAt,
          checklist_dismissed: false,
          tour_progress: null,
        },
        { onConflict: "user_id" },
      );

    if (defaultsErr) {
      console.error("[admin/reset-account] failed to reset defaults:", defaultsErr);
      return NextResponse.json({ error: "Failed to reset account" }, { status: 500 });
    }

    // 3. Force sign-out. supabase-js only exposes auth.admin.signOut(jwt),
    //    which needs the user's own token, so this goes through a service-role
    //    function that clears their GoTrue sessions (migration 082).
    const { error: revokeErr } = await serviceClient.rpc("admin_revoke_user_sessions", {
      p_user_id: userId,
    });
    if (revokeErr) {
      // Non-fatal: the reset already happened, and the password reset below
      // still forces them to re-authenticate.
      console.error("[admin/reset-account] session revoke failed:", revokeErr);
    }

    // 4. Password reset email, using the same flow as "Forgot password" so the
    //    link lands on the existing /auth/reset-password screen.
    let emailSent = false;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && anonKey) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com";
      const anon = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: mailErr } = await anon.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
      });
      if (mailErr) {
        console.error("[admin/reset-account] reset email failed:", mailErr);
      } else {
        emailSent = true;
      }
    }

    logActivity(userId, "account_reset", { parked_releases: parkedCount }, {
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    logAdminAction(
      user.id,
      "admin_reset_account",
      { target_user: userId, parked_releases: parkedCount, reset_email_sent: emailSent },
      { ip, userAgent: req.headers.get("user-agent") ?? undefined },
    );

    return NextResponse.json({ success: true, parkedCount, emailSent });
  } catch (err) {
    console.error("[admin/reset-account] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
