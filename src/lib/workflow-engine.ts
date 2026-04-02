import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { sendQuote } from "@/actions/quotes";
import type { TriggerEvent, ActionType } from "@/types/payments";

export type TriggerContext = {
  userId: string;
  releaseId: string;
  quoteId?: string;
  trackId?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Fire all enabled workflow triggers matching the given event.
 * Queries both release-specific and global (release_id IS NULL) triggers.
 */
export async function fireTrigger(
  event: TriggerEvent,
  context: TriggerContext,
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Fetch matching triggers: release-specific OR global
  const { data: triggers } = await supabase
    .from("workflow_triggers")
    .select("*")
    .eq("user_id", context.userId)
    .eq("trigger_event", event)
    .eq("enabled", true)
    .or(`release_id.eq.${context.releaseId},release_id.is.null`);

  if (!triggers || triggers.length === 0) return;

  for (const trigger of triggers) {
    const actionType = trigger.action_type as ActionType;
    let status: "success" | "failed" | "skipped" = "success";
    const details: Record<string, unknown> = {};

    try {
      const result = await executeAction(actionType, context, trigger.config ?? {});
      if (result.skipped) {
        status = "skipped";
        details.reason = result.reason;
      }
    } catch (err) {
      status = "failed";
      details.error = err instanceof Error ? err.message : String(err);
      console.error(`[workflow] action ${actionType} failed:`, err);
    }

    // Log execution
    await supabase.from("workflow_trigger_log").insert({
      trigger_id: trigger.id,
      user_id: context.userId,
      release_id: context.releaseId,
      trigger_event: event,
      action_type: actionType,
      status,
      details,
    });

    // Update last_triggered_at
    await supabase
      .from("workflow_triggers")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("id", trigger.id);
  }
}

// ── Action Handlers ──────────────────────────────────────────────

type ActionResult = { skipped?: boolean; reason?: string };

async function executeAction(
  actionType: ActionType,
  context: TriggerContext,
  config: Record<string, unknown>,
): Promise<ActionResult> {
  switch (actionType) {
    case "send_invoice":
      return handleSendInvoice(context);
    case "unlock_downloads":
      return handleUnlockDownloads(context);
    case "send_email_thank_you":
      return handleSendEmailThankYou(context);
    case "send_email_testimonial_request":
      return handleSendEmailTestimonialRequest(context, config);
    case "send_payment_reminder":
      return handleSendPaymentReminder(context);
    case "update_release_status":
      return handleUpdateReleaseStatus(context, config);
    default:
      return { skipped: true, reason: `Unknown action: ${actionType}` };
  }
}

async function handleSendInvoice(context: TriggerContext): Promise<ActionResult> {
  const supabase = createSupabaseServiceClient();

  // Find an unsent quote on this release
  const { data: quote } = await supabase
    .from("quotes")
    .select("id")
    .eq("release_id", context.releaseId)
    .eq("user_id", context.userId)
    .eq("status", "draft")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!quote) {
    return { skipped: true, reason: "No unsent draft quote found" };
  }

  // Use service context since workflow engine runs outside auth (e.g. webhooks)
  const result = await sendQuote(quote.id, {
    serviceContext: { userId: context.userId },
  });
  if (result.error) {
    throw new Error(result.error);
  }
  return {};
}

async function handleUnlockDownloads(context: TriggerContext): Promise<ActionResult> {
  const supabase = createSupabaseServiceClient();

  // Find the brief_share for this release and enable downloads
  const { data: share } = await supabase
    .from("brief_shares")
    .select("id, require_payment_for_download")
    .eq("release_id", context.releaseId)
    .maybeSingle();

  if (!share) {
    return { skipped: true, reason: "No portal share found" };
  }

  // Disable the payment gate — downloads become available
  if (share.require_payment_for_download) {
    await supabase
      .from("brief_shares")
      .update({ require_payment_for_download: false })
      .eq("id", share.id);
  }

  return {};
}

async function handleSendEmailThankYou(context: TriggerContext): Promise<ActionResult> {
  const supabase = createSupabaseServiceClient();
  const { buildThankYouEmail } = await import("@/lib/email-templates/workflow-emails");

  // Get release info and client email
  const { data: release } = await supabase
    .from("releases")
    .select("title, client_email, client_name")
    .eq("id", context.releaseId)
    .maybeSingle();

  if (!release?.client_email) {
    return { skipped: true, reason: "No client email" };
  }

  const { getUserDisplayName } = await import("@/lib/email/service");
  const engineerName = await getUserDisplayName(context.userId);

  const { subject, html } = buildThankYouEmail({
    engineerName,
    clientName: release.client_name || "there",
    releaseTitle: release.title,
  });

  const { Resend } = require("resend") as typeof import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Mix Architect <team@mixarchitect.com>",
    to: release.client_email,
    subject,
    html,
  });

  return {};
}

async function handleSendEmailTestimonialRequest(
  context: TriggerContext,
  config: Record<string, unknown>,
): Promise<ActionResult> {
  // For v1: skip delayed sends, just send immediately
  // A future version could use a queue or scheduled task
  const supabase = createSupabaseServiceClient();
  const { buildTestimonialRequestEmail } = await import("@/lib/email-templates/workflow-emails");

  const { data: release } = await supabase
    .from("releases")
    .select("title, client_email, client_name")
    .eq("id", context.releaseId)
    .maybeSingle();

  if (!release?.client_email) {
    return { skipped: true, reason: "No client email" };
  }

  const { getUserDisplayName } = await import("@/lib/email/service");
  const engineerName = await getUserDisplayName(context.userId);

  const { subject, html } = buildTestimonialRequestEmail({
    engineerName,
    clientName: release.client_name || "there",
    releaseTitle: release.title,
  });

  const { Resend } = require("resend") as typeof import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Mix Architect <team@mixarchitect.com>",
    to: release.client_email,
    subject,
    html,
  });

  return {};
}

async function handleSendPaymentReminder(context: TriggerContext): Promise<ActionResult> {
  const supabase = createSupabaseServiceClient();
  const { buildPaymentReminderWorkflowEmail } = await import("@/lib/email-templates/workflow-emails");

  // Find unpaid quotes
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, quote_number, total, currency, client_email, portal_token, due_date")
    .eq("release_id", context.releaseId)
    .eq("user_id", context.userId)
    .in("status", ["sent", "viewed"])
    .order("created_at")
    .limit(1);

  if (!quotes || quotes.length === 0 || !quotes[0].client_email) {
    return { skipped: true, reason: "No unpaid quote with client email" };
  }

  const quote = quotes[0];
  const { getUserDisplayName } = await import("@/lib/email/service");
  const engineerName = await getUserDisplayName(context.userId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com";

  const { data: release } = await supabase
    .from("releases")
    .select("title")
    .eq("id", context.releaseId)
    .maybeSingle();

  const { subject, html } = buildPaymentReminderWorkflowEmail({
    engineerName,
    quoteNumber: quote.quote_number,
    total: Number(quote.total),
    currency: quote.currency,
    releaseTitle: release?.title,
    portalUrl: `${baseUrl}/portal/quote/${quote.portal_token}`,
    dueDate: quote.due_date,
  });

  const { Resend } = require("resend") as typeof import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Mix Architect <team@mixarchitect.com>",
    to: quote.client_email,
    subject,
    html,
  });

  return {};
}

async function handleUpdateReleaseStatus(
  context: TriggerContext,
  config: Record<string, unknown>,
): Promise<ActionResult> {
  const targetStatus = config.target_status as string;
  if (!targetStatus) {
    return { skipped: true, reason: "No target_status configured" };
  }

  const supabase = createSupabaseServiceClient();
  await supabase
    .from("releases")
    .update({ status: targetStatus })
    .eq("id", context.releaseId);

  return {};
}
