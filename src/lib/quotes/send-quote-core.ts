import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { getUserDisplayName, buildUnsubscribeUrl } from "@/lib/email/service";
import { buildQuoteReceivedEmail } from "@/lib/email-templates/quote-emails";
import {
  getWorkspaceSenderFrom,
  getWorkspaceEmailBrand,
  getWorkspaceReplyTo,
} from "@/lib/email/workspace-sender";

type SupabaseLike = ReturnType<typeof createSupabaseServiceClient>;

/**
 * Send a quote as `userId`: flip draft → sent and email the client.
 *
 * NOT a server action — this module has no "use server", so the
 * `userId` identity parameter is never reachable from the network.
 * Callers are responsible for supplying a trusted identity:
 *  - src/actions/quotes.ts `sendQuote` (session-derived user + RLS client)
 *  - src/lib/workflow-engine.ts (service client + the job row's user_id)
 *
 * The previous design exposed this identity override as an options
 * param on the exported server action itself, which let any caller
 * invoke it with an arbitrary userId and the RLS-bypassing service
 * client. Keep it here, out of the action surface.
 */
export async function sendQuoteCore(
  supabase: SupabaseLike,
  userId: string,
  quoteId: string,
): Promise<{ error?: string }> {
  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!quote) return { error: "Quote not found" };
  if (quote.status !== "draft") return { error: "Only draft quotes can be sent" };
  if (!quote.client_email) return { error: "Client email is required to send" };

  // Update status
  const { error } = await supabase
    .from("quotes")
    .update({ status: "sent", issued_at: new Date().toISOString() })
    .eq("id", quoteId);

  if (error) return { error: error.message };

  // Send email to client
  const displayName = await getUserDisplayName(userId);
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com"}/portal/quote/${quote.portal_token}`;

  // Get release title if linked
  let releaseTitle: string | undefined;
  if (quote.release_id) {
    const { data: release } = await supabase
      .from("releases")
      .select("title")
      .eq("id", quote.release_id)
      .maybeSingle();
    releaseTitle = release?.title;
  }

  // Get unsubscribe token for the engineer
  const serviceClient = createSupabaseServiceClient();
  const { data: prefs } = await serviceClient
    .from("email_preferences")
    .select("unsubscribe_token")
    .eq("user_id", userId)
    .maybeSingle();

  const unsubscribeUrl = prefs?.unsubscribe_token
    ? buildUnsubscribeUrl(prefs.unsubscribe_token, "payment_received")
    : undefined;

  const brand = await getWorkspaceEmailBrand(quote.workspace_id);
  const email = buildQuoteReceivedEmail(
    {
      engineerName: displayName,
      quoteNumber: quote.quote_number,
      total: quote.total,
      currency: quote.currency,
      releaseTitle,
      portalUrl,
      unsubscribeUrl,
      documentType: quote.document_type ?? "quote",
    },
    brand,
  );

  // Send directly via Resend (client email, not engineer's preference system)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const { Resend } = require("resend") as typeof import("resend");
    const resend = new Resend(resendKey);
    try {
      await resend.emails.send({
        from: await getWorkspaceSenderFrom(quote.workspace_id),
        replyTo: await getWorkspaceReplyTo(quote.workspace_id),
        to: quote.client_email,
        subject: email.subject,
        html: email.html,
      });
    } catch (err) {
      console.error("[quotes] failed to send quote email:", err);
    }
  }

  revalidatePath("/app/quotes");
  if (quote.release_id) {
    revalidatePath(`/app/releases/${quote.release_id}`);
  }

  return {};
}
