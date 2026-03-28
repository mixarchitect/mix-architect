import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { MoneyDashboard } from "./money-dashboard";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MoneyPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: defaults } = await supabase
    .from("user_defaults")
    .select("payments_enabled, default_currency")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!defaults?.payments_enabled) redirect("/app");

  const currency = defaults.default_currency ?? "USD";

  // Fetch all quotes for this user
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, quote_number, document_type, title, status, total, currency, client_name, client_email, release_id, due_date, paid_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch release titles for display
  const allQuotes = (quotes ?? []) as QuoteRow[];
  const releaseIds = [...new Set(allQuotes.filter((q) => q.release_id).map((q) => q.release_id!))];
  let releases: { id: string; title: string }[] = [];
  if (releaseIds.length > 0) {
    const { data } = await supabase
      .from("releases")
      .select("id, title")
      .in("id", releaseIds);
    releases = (data ?? []) as { id: string; title: string }[];
  }

  // Pass date range params for the DateRangeSelector
  const range = typeof sp.range === "string" ? sp.range : "all";
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const to = typeof sp.to === "string" ? sp.to : undefined;

  return (
    <MoneyDashboard
      quotes={allQuotes}
      releases={releases}
      currency={currency}
      range={range}
      from={from}
      to={to}
    />
  );
}

export type QuoteRow = {
  id: string;
  quote_number: string;
  document_type: string | null;
  title: string | null;
  status: string;
  total: number;
  currency: string;
  client_name: string | null;
  client_email: string | null;
  release_id: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};
