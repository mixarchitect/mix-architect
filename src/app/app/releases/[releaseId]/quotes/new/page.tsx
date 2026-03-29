import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { QuoteBuilder } from "@/components/quotes/quote-builder";
import { getServices } from "@/actions/services";

type Props = {
  params: Promise<{ releaseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewReleaseQuotePage({ params, searchParams }: Props) {
  const { releaseId } = await params;
  const sp = await searchParams;
  const defaultDocumentType = sp.type === "invoice" ? "invoice" as const : undefined;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const locale = await getLocale();

  // Get user defaults for currency
  const { data: defaults } = await supabase
    .from("user_defaults")
    .select("default_currency")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get all releases for dropdown
  const { data: releases } = await supabase
    .from("releases")
    .select("id, title, client_name, client_email, fee_total, fee_currency")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch tracks for auto-populate and services for autocomplete
  const [{ data: tracks }, { services }] = await Promise.all([
    supabase
      .from("tracks")
      .select("id, title, fee")
      .eq("release_id", releaseId)
      .order("track_number"),
    getServices(),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <QuoteBuilder
        releases={(releases ?? []) as { id: string; title: string; client_name: string | null; client_email: string | null; fee_total: number | null; fee_currency: string | null }[]}
        prefilledReleaseId={releaseId}
        releaseTracks={(tracks ?? []) as { id: string; title: string; fee: number | null }[]}
        defaultCurrency={defaults?.default_currency ?? "USD"}
        locale={locale}
        defaultDocumentType={defaultDocumentType}
        services={services}
      />
    </div>
  );
}
