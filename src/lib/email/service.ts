/**
 * Central transactional email dispatcher.
 * Checks user preferences, rate limits, logs all attempts, and sends via Resend.
 * Fire-and-forget: errors are logged but never thrown.
 */

import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit } from "@/lib/rate-limit";

export type EmailCategory =
  | "welcome"
  | "release_live"
  | "new_comment"
  | "payment_reminder"
  | "payment_received"
  | "weekly_digest"
  | "subscription_confirmed"
  | "subscription_cancelled"
  | "client_feedback";

const FROM = "Mix Architect <team@mixarchitect.com>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = require("resend") as typeof import("resend");
  return new Resend(key);
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com";
}

/**
 * Build the one-click unsubscribe URL for a given token and category.
 */
export function buildUnsubscribeUrl(
  unsubscribeToken: string,
  category: EmailCategory,
): string {
  return `${getBaseUrl()}/api/email/unsubscribe?token=${unsubscribeToken}&category=${category}`;
}

type SendTransactionalEmailParams = {
  userId: string;
  to: string;
  category: EmailCategory;
  subject: string;
  html: string;
};

/**
 * Send a transactional email with preference checking, rate limiting, and logging.
 * This function never throws. All outcomes are logged to email_log.
 */
export async function sendTransactionalEmail({
  userId,
  to,
  category,
  subject,
  html,
}: SendTransactionalEmailParams): Promise<void> {
  const supabase = createSupabaseServiceClient();

  try {
    // 1. Check email preferences
    const { data: prefs } = await supabase
      .from("email_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // If no preferences row exists, create one (first-time user)
    if (!prefs) {
      await supabase.from("email_preferences").insert({ user_id: userId });
      // Default is all opted-in, so proceed
    } else {
      // Check the specific category column
      const categoryKey = category as keyof typeof prefs;
      if (prefs[categoryKey] === false) {
        await logEmail(supabase, {
          userId,
          to,
          category,
          subject,
          status: "skipped_preference",
        });
        return;
      }
    }

    // 2. Rate limit: max 3 of the same category per user per hour
    const { success: withinLimit } = rateLimit(
      `email:${userId}:${category}`,
      3,
      3_600_000,
    );

    if (!withinLimit) {
      await logEmail(supabase, {
        userId,
        to,
        category,
        subject,
        status: "skipped_rate_limit",
      });
      return;
    }

    // 3. Send via Resend
    const resend = getResend();
    if (!resend) {
      console.warn("[email/service] Resend not configured, skipping email");
      return;
    }

    // Get unsubscribe token for the List-Unsubscribe header
    const token =
      prefs?.unsubscribe_token ??
      (
        await supabase
          .from("email_preferences")
          .select("unsubscribe_token")
          .eq("user_id", userId)
          .maybeSingle()
      ).data?.unsubscribe_token;

    const unsubscribeUrl = token
      ? buildUnsubscribeUrl(token, category)
      : undefined;

    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      headers: unsubscribeUrl
        ? { "List-Unsubscribe": `<${unsubscribeUrl}>` }
        : undefined,
    });

    if (error) {
      console.error("[email/service] Resend error:", error);
      await logEmail(supabase, {
        userId,
        to,
        category,
        subject,
        status: "failed",
        error: error.message,
      });
      return;
    }

    await logEmail(supabase, {
      userId,
      to,
      category,
      subject,
      status: "sent",
      resendId: data?.id,
    });
  } catch (err) {
    console.error("[email/service] unexpected error:", err);
    await logEmail(supabase, {
      userId,
      to,
      category,
      subject,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    }).catch(() => {
      // Last-resort: even logging failed, just swallow
    });
  }
}

// ─── Internal helpers ────────────────────────────────────────────────

async function logEmail(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  params: {
    userId: string;
    to: string;
    category: string;
    subject: string;
    status: string;
    resendId?: string;
    error?: string;
  },
) {
  const { error } = await supabase.from("email_log").insert({
    user_id: params.userId,
    to_email: params.to,
    category: params.category,
    subject: params.subject,
    status: params.status,
    resend_id: params.resendId ?? null,
    error: params.error ?? null,
  });

  if (error) {
    console.error("[email/service] failed to log email:", error);
  }
}

/**
 * Look up a user's email from auth.users via the admin API.
 * Returns null if the user is not found.
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = createSupabaseServiceClient();
  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(userId);
  return user?.email ?? null;
}

/**
 * Look up a user's display name from auth.users.
 * Falls back to email prefix or "there" if not available.
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(userId);

  if (user?.user_metadata?.display_name) {
    return user.user_metadata.display_name;
  }
  if (user?.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  if (user?.email) {
    return user.email.split("@")[0];
  }
  return "there";
}
