import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { QuoteBuilder } from "@/components/quotes/quote-builder";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("quotes"),
  ]);

  // Get user defaults for currency
  const { data: defaults } = await supabase
    .from("user_defaults")
    .select("default_currency")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get releases for dropdown
  const { data: releases } = await supabase
    .from("releases")
    .select("id, title, client_name, client_email, fee_total, fee_currency")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Pre-fill release_id and document type if provided in query params
  const prefilledReleaseId = typeof sp.release_id === "string" ? sp.release_id : undefined;
  const defaultDocumentType = sp.type === "invoice" ? "invoice" as const : undefined;

  // If a release is pre-selected, fetch its tracks for auto-populate
  let releaseTracks: { id: string; title: string; fee: number | null }[] = [];
  if (prefilledReleaseId) {
    const { data: tracks } = await supabase
      .from("tracks")
      .select("id, title, fee")
      .eq("release_id", prefilledReleaseId)
      .order("track_number");
    releaseTracks = (tracks ?? []) as { id: string; title: string; fee: number | null }[];
  }

  return (
    <div className="max-w-2xl mx-auto">
      <QuoteBuilder
        releases={(releases ?? []) as { id: string; title: string; client_name: string | null; client_email: string | null; fee_total: number | null; fee_currency: string | null }[]}
        prefilledReleaseId={prefilledReleaseId}
        releaseTracks={releaseTracks}
        defaultCurrency={defaults?.default_currency ?? "USD"}
        locale={locale}
        defaultDocumentType={defaultDocumentType}
      />
    </div>
  );
}
