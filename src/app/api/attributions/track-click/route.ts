import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { AttributionSource, AttributionPageType } from "@/types/attribution";

/**
 * POST /api/attributions/track-click
 * Called when someone clicks a "Powered by" CTA or a post-action signup prompt
 * on a client-facing portal page. Creates an attribution record and sets a cookie.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`attribution-click:${ip}`, 30, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { engineer_id, source, page_type } = body as {
      engineer_id: string;
      source: AttributionSource;
      page_type?: AttributionPageType;
    };

    if (!engineer_id || !source) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("signup_attributions")
      .insert({
        engineer_id,
        source,
        page_type: page_type ?? "delivery_portal",
        status: "clicked",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[attributions/track-click] insert failed:", error);
      return NextResponse.json(
        { error: "Failed to create attribution" },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      success: true,
      attribution_id: data.id,
    });

    // Set attribution cookie (30-day expiry, always overwrite)
    response.cookies.set("mix_attribution_id", data.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[attributions/track-click] unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
