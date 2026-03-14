import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { getAnalyticsSummary } from "@/lib/analytics";
import { resolvePreset, formatDateISO, parseDateISO } from "@/lib/admin-date-utils";
import { AnalyticsDashboard } from "./analytics-dashboard";

type PresetKey = "today" | "yesterday" | "7d" | "30d" | "90d" | "365d";

function isPresetKey(v?: string): v is PresetKey {
  return !!v && ["today", "yesterday", "7d", "30d", "90d", "365d"].includes(v);
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; compare?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const params = await searchParams;
  const rangeKey = params.range;

  let from: string;
  let to: string;

  if (isPresetKey(rangeKey)) {
    const resolved = resolvePreset(rangeKey);
    from = formatDateISO(resolved.from);
    to = formatDateISO(resolved.to);
  } else if (params.from && params.to) {
    from = params.from;
    to = params.to;
  } else {
    // Default: last 365 days
    const resolved = resolvePreset("365d");
    from = formatDateISO(resolved.from);
    to = formatDateISO(resolved.to);
  }

  const summary = await getAnalyticsSummary(user.id, from, to);

  return (
    <AnalyticsDashboard
      summary={summary}
      from={from}
      to={to}
      range={rangeKey || "365d"}
      compare={params.compare}
    />
  );
}
