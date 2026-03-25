"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuotesList } from "@/components/quotes/quotes-list";
import { getQuotes } from "@/actions/quotes";
import type { Quote } from "@/types/payments";

type Props = {
  releaseId: string;
  locale: string;
};

export function ReleaseQuotesTab({ releaseId, locale }: Props) {
  const t = useTranslations("quotes");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuotes({ release_id: releaseId })
      .then(({ quotes }) => setQuotes(quotes))
      .finally(() => setLoading(false));
  }, [releaseId]);

  if (loading) {
    return <div className="text-sm text-muted py-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Link href={`/app/releases/${releaseId}/quotes/new`}>
          <Button variant="secondary" className="h-9 text-xs">
            <Plus size={14} />
            {t("createQuote")}
          </Button>
        </Link>
      </div>
      <QuotesList
        quotes={quotes}
        releaseId={releaseId}
        locale={locale}
      />
    </div>
  );
}
