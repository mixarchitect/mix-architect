/**
 * Drains the email_outbox table seeded by the handle_new_user() DB trigger.
 *
 * The outbox exists because the welcome email must not depend on the browser:
 * the trigger enqueues a row with the recipient taken from the created
 * auth.users record, and this drain runs from every server-side touchpoint
 * where a session first exists (signup route, auth callback, activity log)
 * plus a cron safety net. Rows are claimed with a conditional update so
 * concurrent drains cannot double-send.
 */

import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import {
  sendTransactionalEmail,
  buildUnsubscribeUrl,
  getUserEmail,
} from "@/lib/email/service";
import { buildWelcomeEmail } from "@/lib/email-templates/transactional";
import { buildAdminEmail } from "@/lib/email-templates/admin-notification";

const MAX_ATTEMPTS = 3;

type OutboxRow = {
  id: string;
  user_id: string;
  to_email: string;
  display_name: string | null;
  category: string;
  attempts: number;
};

/**
 * Process pending outbox rows. Pass userId to drain a single user's rows
 * (the post-signup / post-login path); omit it for the cron sweep.
 * Never throws. Returns the number of rows that reached a terminal state.
 */
export async function drainEmailOutbox(
  opts: { userId?: string; limit?: number } = {},
): Promise<number> {
  const { userId, limit = 10 } = opts;
  const svc = createSupabaseServiceClient();

  try {
    let query = svc
      .from("email_outbox")
      .select("id, user_id, to_email, display_name, category, attempts")
      .eq("status", "pending")
      .lt("attempts", MAX_ATTEMPTS)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (userId) query = query.eq("user_id", userId);

    const { data: rows, error } = await query;
    if (error) {
      console.error("[email/outbox] select failed:", error);
      return 0;
    }
    if (!rows || rows.length === 0) return 0;

    let settled = 0;
    for (const row of rows as OutboxRow[]) {
      const attempts = row.attempts + 1;
      const { data: claimed } = await svc
        .from("email_outbox")
        .update({ status: "processing", attempts })
        .eq("id", row.id)
        .eq("status", "pending")
        .select("id");
      if (!claimed || claimed.length === 0) continue;

      // The admin signup alert rides on the first delivery attempt so admins
      // hear about the signup even if the welcome email itself fails.
      if (row.category === "welcome" && attempts === 1) {
        await notifyAdminsOfSignup(row.to_email, row.display_name ?? row.to_email);
      }

      let outcome: "sent" | "skipped" | "retry";
      if (row.category === "welcome") {
        outcome = await sendWelcome(svc, row);
      } else {
        // Unknown categories are terminal: better a skipped row than a
        // poison message that blocks the pending sweep forever.
        outcome = "skipped";
      }

      if (outcome === "retry" && attempts < MAX_ATTEMPTS) {
        await svc
          .from("email_outbox")
          .update({ status: "pending" })
          .eq("id", row.id);
        continue;
      }

      await svc
        .from("email_outbox")
        .update({
          status: outcome === "retry" ? "failed" : outcome,
          processed_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      settled += 1;
    }
    return settled;
  } catch (err) {
    console.error("[email/outbox] drain failed:", err);
    return 0;
  }
}

async function sendWelcome(
  svc: ReturnType<typeof createSupabaseServiceClient>,
  row: OutboxRow,
): Promise<"sent" | "skipped" | "retry"> {
  const { data: prefs } = await svc
    .from("email_preferences")
    .select("unsubscribe_token")
    .eq("user_id", row.user_id)
    .maybeSingle();

  const unsubscribeUrl = prefs?.unsubscribe_token
    ? buildUnsubscribeUrl(prefs.unsubscribe_token, "welcome")
    : undefined;

  const displayName = row.display_name ?? row.to_email.split("@")[0];
  const { subject, html } = buildWelcomeEmail({ displayName, unsubscribeUrl });

  const result = await sendTransactionalEmail({
    userId: row.user_id,
    to: row.to_email,
    category: "welcome",
    subject,
    html,
  });

  if (result === "sent") return "sent";
  if (result === "skipped_preference" || result === "skipped_rate_limit") {
    return "skipped";
  }
  await svc
    .from("email_outbox")
    .update({ last_error: result })
    .eq("id", row.id);
  return "retry";
}

/**
 * Email all admins that a new user signed up. Internal ops alert — sent
 * directly (not through the user-preference system), never throws.
 */
async function notifyAdminsOfSignup(newUserEmail: string, newUserName: string) {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) return;
    const svc = createSupabaseServiceClient();
    const { data: admins } = await svc.from("profiles").select("id").eq("is_admin", true);
    if (!admins || admins.length === 0) return;

    const emails = (
      await Promise.all(admins.map((a) => getUserEmail(a.id as string)))
    ).filter((e): e is string => !!e);
    if (emails.length === 0) return;

    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com";
    const { subject, html } = buildAdminEmail({
      subject: `New signup: ${newUserEmail}`,
      heading: "New user signed up",
      body: `${newUserName} (${newUserEmail}) just created a Mix Architect account.`,
      ctaLabel: "View subscribers",
      ctaUrl: `${appUrl}/admin/subscribers`,
    });
    await resend.emails.send({
      from: "Mix Architect <team@mixarchitect.com>",
      to: emails,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email/outbox] admin signup alert failed (non-fatal):", err);
  }
}
