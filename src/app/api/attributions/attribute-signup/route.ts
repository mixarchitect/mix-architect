import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/attributions/attribute-signup
 * Called during the signup flow when an attribution cookie is present.
 * Links the AUTHENTICATED user to the attribution record and sets
 * attributed_to_engineer on the profile.
 *
 * Authorization: the target user id is taken from the session, NOT
 * the request body. The previous version trusted body.new_user_id +
 * a body-supplied attribution_id (which is publicly returned by
 * /track-click), letting any caller stamp attribution onto any
 * user's profile.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`attribution-signup:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    // Auth: the caller MUST be the just-signed-up user.
    const userClient = await createSupabaseServerClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const new_user_id = user.id;

    const body = await req.json();
    const { attribution_id } = body as { attribution_id: string };

    if (!attribution_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServiceClient();

    // Look up the attribution record
    const { data: attribution, error: lookupErr } = await supabase
      .from("signup_attributions")
      .select("id, engineer_id, status")
      .eq("id", attribution_id)
      .maybeSingle();

    if (lookupErr) {
      console.error("[attributions/attribute-signup] lookup failed:", lookupErr);
      return NextResponse.json(
        { error: "Failed to find attribution" },
        { status: 500 },
      );
    }

    if (!attribution) {
      // Invalid or expired attribution ID, signup still works, just no attribution
      const response = NextResponse.json({ success: true, attributed: false });
      response.cookies.delete("mix_attribution_id");
      return response;
    }

    // Already attributed (idempotent)
    if (attribution.status === "signed_up") {
      const response = NextResponse.json({ success: true, attributed: true });
      response.cookies.delete("mix_attribution_id");
      return response;
    }

    // Update the attribution record
    const { error: updateErr } = await supabase
      .from("signup_attributions")
      .update({
        attributed_user_id: new_user_id,
        status: "signed_up",
        signed_up_at: new Date().toISOString(),
      })
      .eq("id", attribution_id);

    if (updateErr) {
      console.error("[attributions/attribute-signup] update failed:", updateErr);
      // Non-fatal: user signup still succeeded
    }

    // Set attributed_to_engineer on the new user's profile
    if (attribution.engineer_id) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ attributed_to_engineer: attribution.engineer_id })
        .eq("id", new_user_id);

      if (profileErr) {
        console.error("[attributions/attribute-signup] profile update failed:", profileErr);
        // Non-fatal
      }
    }

    const response = NextResponse.json({ success: true, attributed: true });
    response.cookies.delete("mix_attribution_id");
    return response;
  } catch (err) {
    console.error("[attributions/attribute-signup] unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
