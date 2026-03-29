import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect, notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getQuote } from "@/actions/quotes";
import { getServices } from "@/actions/services";
import { QuoteBuilder } from "@/components/quotes/quote-builder";

type Props = {
  params: Promise<{ releaseId: string; quoteId: string }>;
};

export default async function QuoteDetailPage({ params }: Props) {
  const { releaseId, quoteId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const [{ quote, error }, locale, { services }] = await Promise.all([
    getQuote(quoteId),
    getLocale(),
    getServices(),
  ]);

  if (error || !quote) notFound();

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

  return (
    <div className="max-w-2xl mx-auto">
      <QuoteBuilder
        releases={(releases ?? []) as { id: string; title: string; client_name: string | null; client_email: string | null; fee_total: number | null; fee_currency: string | null }[]}
        prefilledReleaseId={releaseId}
        defaultCurrency={defaults?.default_currency ?? "USD"}
        locale={locale}
        existingQuote={quote}
        services={services}
      />
    </div>
  );
}
