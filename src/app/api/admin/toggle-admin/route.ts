import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit-logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";

/**
 * POST /api/admin/toggle-admin
 * Promote or demote a user to/from admin.
 *
 * Body: { userId: string; action: "promote" | "demote" }
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-toggle:${ip}`, 10, 60_000);
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
    const { userId, action } = body as {
      userId: string;
      action: "promote" | "demote";
    };

    if (!userId || !action || !["promote", "demote"].includes(action)) {
      return NextResponse.json(
        { error: "Missing required fields: userId, action (promote|demote)" },
        { status: 400 },
      );
    }

    // Prevent self-demotion
    if (action === "demote" && userId === user.id) {
      return NextResponse.json(
        { error: "You cannot remove your own admin access" },
        { status: 400 },
      );
    }

    const serviceClient = createSupabaseServiceClient();
    const { error } = await serviceClient
      .from("profiles")
      .update({ is_admin: action === "promote" })
      .eq("id", userId);

    if (error) {
      console.error("[admin/toggle-admin] update failed:", error);
      return NextResponse.json({ error: "Failed to update admin status" }, { status: 500 });
    }

    logAdminAction(
      user.id,
      `admin_${action}`,
      { target_user: userId },
      { ip: getClientIp(req), userAgent: req.headers.get("user-agent") ?? undefined },
    );

    return NextResponse.json({ success: true, action, is_admin: action === "promote" });
  } catch (err) {
    console.error("[admin/toggle-admin] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
