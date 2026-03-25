import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getQuotes } from "@/actions/quotes";
import { QuotesList } from "@/components/quotes/quotes-list";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function QuotesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const [{ quotes }, locale, t] = await Promise.all([
    getQuotes(),
    getLocale(),
    getTranslations("quotes"),
  ]);

  // Fetch release titles for display
  const releaseIds = [...new Set(quotes.filter((q) => q.release_id).map((q) => q.release_id!))];
  let releases: { id: string; title: string }[] = [];
  if (releaseIds.length > 0) {
    const { data } = await supabase
      .from("releases")
      .select("id, title")
      .in("id", releaseIds);
    releases = (data ?? []) as { id: string; title: string }[];
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text">{t("title")}</h1>
        <Link
          href="/app/quotes/new"
          className="btn-primary inline-flex items-center gap-1.5 h-9 px-4 text-sm font-semibold rounded-sm"
        >
          <Plus size={14} />
          {t("createQuote")}
        </Link>
      </div>

      <QuotesList
        quotes={quotes}
        showRelease
        locale={locale}
        releases={releases}
      />
    </div>
  );
}
