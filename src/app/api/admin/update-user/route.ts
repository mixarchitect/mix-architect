import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * POST /api/admin/update-user
 * Updates user details: display_name, email, persona, is_test_account
 */
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, field, value } = body as {
      userId: string;
      field: string;
      value: string | boolean;
    };

    if (!userId || !field) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const service = createSupabaseServiceClient();

    switch (field) {
      case "display_name": {
        const { error } = await service.auth.admin.updateUserById(userId, {
          user_metadata: { display_name: value as string },
        });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case "email": {
        const { error } = await service.auth.admin.updateUserById(userId, {
          email: value as string,
        });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case "persona": {
        const validPersonas = ["artist", "engineer", "both", "other"];
        if (!validPersonas.includes(value as string)) {
          return NextResponse.json({ error: "Invalid persona value" }, { status: 400 });
        }
        const { error } = await service
          .from("user_defaults")
          .upsert({ user_id: userId, persona: value }, { onConflict: "user_id" });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case "is_test_account": {
        const { error } = await service
          .from("profiles")
          .update({ is_test_account: value === true })
          .eq("id", userId);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown field" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/update-user] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
