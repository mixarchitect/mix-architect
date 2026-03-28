import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QuotePortalClient } from "./quote-portal-client";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = createSupabaseServiceClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("quote_number, client_name, user_id, document_type")
    .eq("portal_token", token)
    .maybeSingle();

  if (!quote) return { title: "Document Not Found" };

  // Get engineer name
  const { data: defaults } = await supabase
    .from("user_defaults")
    .select("company_name")
    .eq("user_id", quote.user_id)
    .maybeSingle();

  const { data: { user: engineer } } = await supabase.auth.admin.getUserById(quote.user_id);
  const engineerName = defaults?.company_name
    || engineer?.user_metadata?.display_name
    || engineer?.email?.split("@")[0]
    || "Mix Architect";

  return {
    title: `${quote.document_type === "invoice" ? "Invoice" : "Quote"} ${quote.quote_number} — ${engineerName}`,
    robots: { index: false, follow: false },
  };
}

export default async function QuotePortalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const sp = await searchParams;
  const supabase = createSupabaseServiceClient();

  // Fetch quote by portal token
  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("portal_token", token)
    .maybeSingle();

  if (!quote) notFound();

  // Fetch line items
  const { data: lineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("sort_order");

  // Fetch engineer info
  const [defaultsRes, engineerRes, connectedAccountRes] = await Promise.all([
    supabase
      .from("user_defaults")
      .select("company_name")
      .eq("user_id", quote.user_id)
      .maybeSingle(),
    supabase.auth.admin.getUserById(quote.user_id),
    supabase
      .from("stripe_connected_accounts")
      .select("stripe_account_id, charges_enabled")
      .eq("user_id", quote.user_id)
      .maybeSingle(),
  ]);

  const engineer = engineerRes.data?.user;
  const engineerName = defaultsRes.data?.company_name
    || engineer?.user_metadata?.display_name
    || engineer?.email?.split("@")[0]
    || "Mix Architect";

  // Fetch release title if linked
  let releaseTitle: string | null = null;
  if (quote.release_id) {
    const { data: release } = await supabase
      .from("releases")
      .select("title")
      .eq("id", quote.release_id)
      .maybeSingle();
    releaseTitle = release?.title ?? null;
  }

  // Mark as viewed if currently 'sent'
  // Auto-expire if past expiry date
  if (
    quote.expires_at &&
    new Date(quote.expires_at) < new Date() &&
    !["paid", "expired", "cancelled"].includes(quote.status)
  ) {
    await supabase
      .from("quotes")
      .update({ status: "expired" })
      .eq("id", quote.id);
    quote.status = "expired";
  }

  // Mark as viewed if currently 'sent'
  if (quote.status === "sent") {
    await supabase
      .from("quotes")
      .update({ status: "viewed" })
      .eq("id", quote.id);
  }

  // Check if payment is possible
  const canPay =
    connectedAccountRes.data?.charges_enabled === true &&
    ["sent", "viewed", "accepted"].includes(quote.status) &&
    (!quote.expires_at || new Date(quote.expires_at) > new Date());

  // Fetch schedule context if part of a payment schedule
  let scheduleQuotes: typeof quote[] = [];
  if (quote.schedule_group_id) {
    const { data } = await supabase
      .from("quotes")
      .select("id, quote_number, schedule_label, schedule_order, total, status, paid_at")
      .eq("schedule_group_id", quote.schedule_group_id)
      .order("schedule_order");
    scheduleQuotes = data ?? [];
  }

  const paymentResult = typeof sp.payment === "string" ? sp.payment : null;

  return (
    <QuotePortalClient
      quote={{ ...quote, line_items: lineItems ?? [] }}
      engineerName={engineerName}
      releaseTitle={releaseTitle}
      canPay={canPay}
      hasStripeConnected={!!connectedAccountRes.data}
      token={token}
      paymentResult={paymentResult}
      scheduleQuotes={scheduleQuotes}
    />
  );
}
