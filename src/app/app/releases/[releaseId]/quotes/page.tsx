import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getQuotes } from "@/actions/quotes";
import { QuotesList } from "@/components/quotes/quotes-list";

type Props = {
  params: Promise<{ releaseId: string }>;
};

export default async function ReleaseQuotesPage({ params }: Props) {
  const { releaseId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const [{ quotes }, locale] = await Promise.all([
    getQuotes({ release_id: releaseId }),
    getLocale(),
  ]);

  return (
    <QuotesList
      quotes={quotes}
      releaseId={releaseId}
      locale={locale}
    />
  );
}
