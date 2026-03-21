import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit-logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/admin/delete-user
 * Permanently delete a user and all their data.
 *
 * Body: { userId: string }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-delete-user:${ip}`, 5, 60_000);
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

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    const serviceClient = createSupabaseServiceClient();

    // Delete the user from Supabase Auth (cascades to profiles via FK)
    const { error } = await serviceClient.auth.admin.deleteUser(userId);

    if (error) {
      console.error("[admin/delete-user] delete failed:", error);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    logAdminAction(
      user.id,
      "admin_delete_user",
      { target_user: userId },
      { ip: getClientIp(req), userAgent: req.headers.get("user-agent") ?? undefined },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/delete-user] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
