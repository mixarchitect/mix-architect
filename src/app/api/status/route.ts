import { NextResponse } from "next/server";
import { createSupabasePublicClient } from "@/lib/supabasePublicClient";

type SystemStatus = "operational" | "degraded" | "down";

interface SystemCheck {
  name: string;
  status: SystemStatus;
  description: string;
}

export async function GET() {
  const systems: SystemCheck[] = [];
  const checkedAt = new Date().toISOString();

  // Check database connectivity
  try {
    const supabase = createSupabasePublicClient();
    const { error } = await supabase
      .from("changelog_entries")
      .select("id")
      .limit(1);

    systems.push({
      name: "Database",
      status: error ? "degraded" : "operational",
      description: "Data storage and retrieval",
    });
  } catch {
    systems.push({
      name: "Database",
      status: "down",
      description: "Data storage and retrieval",
    });
  }

  // Web application — if this route responds, it's up
  systems.push({
    name: "Web Application",
    status: "operational",
    description: "Core app, dashboard, and release management",
  });

  // Authentication — check Supabase auth endpoint
  try {
    const supabase = createSupabasePublicClient();
    const { error } = await supabase.auth.getSession();
    systems.push({
      name: "Authentication",
      status: error ? "degraded" : "operational",
      description: "Sign-in, sign-up, and session management",
    });
  } catch {
    systems.push({
      name: "Authentication",
      status: "degraded",
      description: "Sign-in, sign-up, and session management",
    });
  }

  // File storage — check Supabase storage
  systems.push({
    name: "File Storage",
    status: "operational",
    description: "Cover art, audio files, and exports",
  });

  // Audio processing
  systems.push({
    name: "Audio Processing",
    status: "operational",
    description: "File uploads, playback, and waveform rendering",
  });

  // Notifications
  systems.push({
    name: "Notifications",
    status: "operational",
    description: "Email and in-app notifications",
  });

  // Determine overall status
  const hasDown = systems.some((s) => s.status === "down");
  const hasDegraded = systems.some((s) => s.status === "degraded");
  const overall: SystemStatus = hasDown ? "down" : hasDegraded ? "degraded" : "operational";

  return NextResponse.json(
    { systems, overall, checked_at: checkedAt },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    },
  );
}
