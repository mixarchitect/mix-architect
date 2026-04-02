"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import {
  sendTransactionalEmail,
  getUserDisplayName,
  buildUnsubscribeUrl,
} from "@/lib/email/service";
import { buildQuoteReceivedEmail } from "@/lib/email-templates/quote-emails";
import { syncPaymentStatus } from "@/lib/payment-sync";
import { fireTrigger } from "@/lib/workflow-engine";
import type { Quote, QuoteLineItem, PaymentSchedule } from "@/types/payments";

// ── Types ────────────────────────────────────────────────────────

type CreateLineItemInput = {
  description: string;
  quantity: number;
  unit_price: number;
  track_id?: string | null;
  sort_order: number;
};

type CreateQuoteInput = {
  release_id?: string | null;
  document_type?: "quote" | "invoice";
  title?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  currency?: string;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string | null;
  internal_notes?: string | null;
  terms?: string | null;
  due_date?: string | null;
  expires_at?: string | null;
  line_items: CreateLineItemInput[];
};

type UpdateQuoteInput = Partial<Omit<CreateQuoteInput, "line_items">> & {
  line_items?: (CreateLineItemInput & { id?: string })[];
};

type CreateScheduleInput = {
  release_id: string;
  client_name?: string | null;
  client_email?: string | null;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  installments: {
    label: string;
    amount: number;
    due_date?: string | null;
    line_items?: CreateLineItemInput[];
  }[];
};

// ── Helpers ──────────────────────────────────────────────────────

async function getNextDocumentNumber(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  documentType: "quote" | "invoice" = "quote",
): Promise<string> {
  const prefix = documentType === "invoice" ? "INV" : "Q";
  const pattern = `${prefix}-`;

  // Use count of all matching documents + 1 to reduce collision likelihood,
  // then scan for the highest existing number as a fallback
  const { data } = await supabase
    .from("quotes")
    .select("quote_number")
    .eq("user_id", userId)
    .eq("document_type", documentType)
    .like("quote_number", `${pattern}%`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!data || data.length === 0) return `${prefix}-001`;

  // Find the highest existing number across all documents (not just the latest)
  let maxNum = 0;
  for (const row of data) {
    const match = row.quote_number.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  const next = maxNum + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

function computeTotals(
  lineItems: { quantity: number; unit_price: number }[],
  discountAmount = 0,
  taxAmount = 0,
) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const total = Math.max(0, subtotal - discountAmount + taxAmount);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

function validateLineItems(
  items: { description?: string; quantity: number; unit_price: number }[],
): string | null {
  if (!items || items.length === 0) {
    return "At least one line item is required";
  }
  for (const item of items) {
    if (!item.description?.trim()) {
      return "Line item description is required";
    }
    if (item.quantity <= 0) {
      return "Quantity must be greater than 0";
    }
    if (item.unit_price < 0 || item.unit_price > 999999.99) {
      return "Unit price must be between 0 and 999,999.99";
    }
  }
  return null;
}

// ── CRUD ─────────────────────────────────────────────────────────

export async function getQuotes(filters?: {
  release_id?: string;
  status?: string;
}): Promise<{ quotes: Quote[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { quotes: [], error: "Not authenticated" };

  let query = supabase
    .from("quotes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters?.release_id) {
    query = query.eq("release_id", filters.release_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) return { quotes: [], error: error.message };
  return { quotes: (data ?? []) as Quote[] };
}

export async function getQuote(
  quoteId: string,
): Promise<{ quote: Quote | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { quote: null, error: "Not authenticated" };

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { quote: null, error: error.message };
  if (!quote) return { quote: null, error: "Quote not found" };

  // Fetch line items
  const { data: lineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order");

  return {
    quote: {
      ...quote,
      line_items: (lineItems ?? []) as QuoteLineItem[],
    } as Quote,
  };
}

export async function createQuote(
  data: CreateQuoteInput,
): Promise<{ quote: Quote | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { quote: null, error: "Not authenticated" };

  // Input validation
  const lineItemError = validateLineItems(data.line_items);
  if (lineItemError) return { quote: null, error: lineItemError };
  if (data.discount_amount && (data.discount_amount < 0 || data.discount_amount > 999999.99)) {
    return { quote: null, error: "Invalid discount amount" };
  }
  if (data.tax_amount && (data.tax_amount < 0 || data.tax_amount > 999999.99)) {
    return { quote: null, error: "Invalid tax amount" };
  }
  if (data.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.client_email)) {
    return { quote: null, error: "Invalid email address" };
  }

  const docType = data.document_type ?? "quote";
  const quoteNumber = await getNextDocumentNumber(supabase, user.id, docType);
  const { subtotal, total } = computeTotals(
    data.line_items,
    data.discount_amount,
    data.tax_amount,
  );

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      release_id: data.release_id ?? null,
      document_type: docType,
      quote_number: quoteNumber,
      title: data.title ?? null,
      status: "draft",
      subtotal,
      discount_amount: data.discount_amount ?? 0,
      tax_amount: data.tax_amount ?? 0,
      total,
      currency: data.currency ?? "USD",
      client_name: data.client_name ?? null,
      client_email: data.client_email ?? null,
      notes: data.notes ?? null,
      internal_notes: data.internal_notes ?? null,
      terms: data.terms ?? null,
      due_date: data.due_date ?? null,
      expires_at: data.expires_at ?? null,
    })
    .select()
    .single();

  if (error) return { quote: null, error: error.message };

  // Insert line items
  if (data.line_items.length > 0) {
    const lineItemRows = data.line_items.map((item) => ({
      quote_id: quote.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: Math.round(item.quantity * item.unit_price * 100) / 100,
      track_id: item.track_id ?? null,
      sort_order: item.sort_order,
    }));

    await supabase.from("quote_line_items").insert(lineItemRows);
  }

  if (data.release_id) {
    await syncPaymentStatus(data.release_id);
    revalidatePath(`/app/releases/${data.release_id}`);
  }
  revalidatePath("/app/quotes");

  return { quote: quote as Quote };
}

export async function updateQuote(
  quoteId: string,
  data: UpdateQuoteInput,
): Promise<{ quote: Quote | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { quote: null, error: "Not authenticated" };

  // Verify ownership and editable status
  const { data: existing } = await supabase
    .from("quotes")
    .select("id, status, release_id, discount_amount, tax_amount")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { quote: null, error: "Quote not found" };
  if (existing.status === "paid" || existing.status === "expired") {
    return { quote: null, error: "Cannot edit a paid or expired quote" };
  }

  // Validate line items if provided
  if (data.line_items) {
    const lineItemError = validateLineItems(data.line_items);
    if (lineItemError) return { quote: null, error: lineItemError };
  }
  if (data.discount_amount !== undefined && (data.discount_amount < 0 || data.discount_amount > 999999.99)) {
    return { quote: null, error: "Invalid discount amount" };
  }
  if (data.tax_amount !== undefined && (data.tax_amount < 0 || data.tax_amount > 999999.99)) {
    return { quote: null, error: "Invalid tax amount" };
  }

  // Recalculate totals if line items changed
  const updateFields: Record<string, unknown> = {};
  const fieldMap: Record<string, string> = {
    release_id: "release_id",
    title: "title",
    client_name: "client_name",
    client_email: "client_email",
    currency: "currency",
    discount_amount: "discount_amount",
    tax_amount: "tax_amount",
    notes: "notes",
    internal_notes: "internal_notes",
    terms: "terms",
    due_date: "due_date",
    expires_at: "expires_at",
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in data) {
      updateFields[col] = data[key as keyof UpdateQuoteInput] ?? null;
    }
  }

  // Handle line items
  if (data.line_items) {
    // Delete existing and re-insert
    await supabase.from("quote_line_items").delete().eq("quote_id", quoteId);

    if (data.line_items.length > 0) {
      const lineItemRows = data.line_items.map((item) => ({
        quote_id: quoteId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: Math.round(item.quantity * item.unit_price * 100) / 100,
        track_id: item.track_id ?? null,
        sort_order: item.sort_order,
      }));

      await supabase.from("quote_line_items").insert(lineItemRows);
    }

    // Use explicitly provided values, falling back to existing DB values
    const effectiveDiscount = data.discount_amount ?? Number(existing.discount_amount) ?? 0;
    const effectiveTax = data.tax_amount ?? Number(existing.tax_amount) ?? 0;
    const { subtotal, total } = computeTotals(
      data.line_items,
      effectiveDiscount,
      effectiveTax,
    );
    updateFields.subtotal = subtotal;
    updateFields.total = total;
  }

  const { data: quote, error } = await supabase
    .from("quotes")
    .update(updateFields)
    .eq("id", quoteId)
    .select()
    .single();

  if (error) return { quote: null, error: error.message };

  if (existing.release_id) {
    await syncPaymentStatus(existing.release_id);
    revalidatePath(`/app/releases/${existing.release_id}`);
  }
  revalidatePath(`/app/quotes`);

  return { quote: quote as Quote };
}

export async function deleteQuote(
  quoteId: string,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status, release_id")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!quote) return { error: "Quote not found" };

  if (quote.status === "draft") {
    // Hard delete for drafts
    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", quoteId);
    if (error) return { error: error.message };
  } else {
    // Soft delete for sent/viewed quotes
    const { error } = await supabase
      .from("quotes")
      .update({ status: "cancelled" })
      .eq("id", quoteId);
    if (error) return { error: error.message };
  }

  if (quote.release_id) {
    await syncPaymentStatus(quote.release_id);
    revalidatePath(`/app/releases/${quote.release_id}`);
  }
  revalidatePath("/app/quotes");

  return {};
}

/**
 * Send a quote. Can be called from both authenticated (server action) and
 * service-client contexts (workflow engine).
 *
 * @param quoteId - The quote ID to send
 * @param options.serviceContext - If provided, uses service client instead of
 *   requiring auth. Must include userId for ownership verification.
 */
export async function sendQuote(
  quoteId: string,
  options?: { serviceContext?: { userId: string } },
): Promise<{ error?: string }> {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  let userId: string;

  if (options?.serviceContext) {
    // Service-client context (workflow engine, webhooks)
    supabase = createSupabaseServiceClient() as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>;
    userId = options.serviceContext.userId;
  } else {
    // Authenticated context (server action)
    supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    userId = user.id;
  }

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

  const email = buildQuoteReceivedEmail({
    engineerName: displayName,
    quoteNumber: quote.quote_number,
    total: quote.total,
    currency: quote.currency,
    releaseTitle,
    portalUrl,
    unsubscribeUrl,
    documentType: quote.document_type ?? "quote",
  });

  // Send directly via Resend (client email, not engineer's preference system)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const { Resend } = require("resend") as typeof import("resend");
    const resend = new Resend(resendKey);
    try {
      await resend.emails.send({
        from: "Mix Architect <team@mixarchitect.com>",
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

export async function duplicateQuote(
  quoteId: string,
): Promise<{ quote: Quote | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { quote: null, error: "Not authenticated" };

  const { data: source } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!source) return { quote: null, error: "Quote not found" };

  // Fetch line items
  const { data: sourceLineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order");

  // Filter out invalid line items so createQuote validation doesn't reject drafts
  const validLineItems = (sourceLineItems ?? [])
    .filter((item: { description?: string }) => item.description?.trim())
    .map((item: { description: string; quantity: number; unit_price: number; track_id?: string | null; sort_order: number }) => ({
      description: item.description,
      quantity: item.quantity > 0 ? item.quantity : 1,
      unit_price: item.unit_price,
      track_id: item.track_id,
      sort_order: item.sort_order,
    }));

  // Ensure at least one line item exists
  if (validLineItems.length === 0) {
    validLineItems.push({
      description: source.title || "Line item",
      quantity: 1,
      unit_price: 0,
      track_id: null,
      sort_order: 0,
    });
  }

  return createQuote({
    document_type: source.document_type,
    release_id: source.release_id,
    title: source.title ? `${source.title} (copy)` : null,
    client_name: source.client_name,
    client_email: source.client_email,
    currency: source.currency,
    discount_amount: source.discount_amount,
    tax_amount: source.tax_amount,
    notes: source.notes,
    internal_notes: source.internal_notes,
    terms: source.terms,
    due_date: source.due_date,
    expires_at: null,
    line_items: validLineItems,
  });
}

export async function markQuotePaid(
  quoteId: string,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch quote and validate status before updating
  const { data: quoteData } = await supabase
    .from("quotes")
    .select("release_id, status")
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!quoteData) return { error: "Quote not found" };

  if (quoteData.status === "paid") {
    return { error: "Quote is already marked as paid" };
  }
  if (quoteData.status === "cancelled") {
    return { error: "Cannot mark a cancelled quote as paid" };
  }
  if (quoteData.status === "expired") {
    return { error: "Cannot mark an expired quote as paid" };
  }

  const { error } = await supabase
    .from("quotes")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: "manual",
    })
    .eq("id", quoteId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // Sync release payment status + fire workflow trigger
  if (quoteData.release_id) {
    await syncPaymentStatus(quoteData.release_id);
    fireTrigger("payment_received", {
      userId: user.id,
      releaseId: quoteData.release_id,
      quoteId,
    }).catch(console.error);
    revalidatePath(`/app/releases/${quoteData.release_id}`);
  }

  revalidatePath("/app/quotes");
  return {};
}

// ── Payment Schedules ────────────────────────────────────────────

export async function createPaymentSchedule(
  data: CreateScheduleInput,
): Promise<{ schedule: PaymentSchedule | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { schedule: null, error: "Not authenticated" };

  if (data.installments.length < 2) {
    return { schedule: null, error: "A schedule requires at least 2 installments" };
  }

  const scheduleGroupId = crypto.randomUUID();
  const quotes: Quote[] = [];

  for (let i = 0; i < data.installments.length; i++) {
    const inst = data.installments[i];
    const quoteNumber = await getNextDocumentNumber(supabase, user.id, "quote");

    const lineItems = inst.line_items?.length
      ? inst.line_items
      : [
          {
            description: inst.label,
            quantity: 1,
            unit_price: inst.amount,
            sort_order: 0,
          },
        ];

    const { subtotal, total } = computeTotals(lineItems);

    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        release_id: data.release_id,
        quote_number: quoteNumber,
        title: inst.label,
        status: "draft",
        subtotal,
        total,
        currency: data.currency ?? "USD",
        client_name: data.client_name ?? null,
        client_email: data.client_email ?? null,
        notes: data.notes ?? null,
        terms: data.terms ?? null,
        due_date: inst.due_date ?? null,
        schedule_group_id: scheduleGroupId,
        schedule_label: inst.label,
        schedule_order: i + 1,
      })
      .select()
      .single();

    if (error) return { schedule: null, error: error.message };

    // Insert line items
    const lineItemRows = lineItems.map((item) => ({
      quote_id: quote.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: Math.round(item.quantity * item.unit_price * 100) / 100,
      track_id: item.track_id ?? null,
      sort_order: item.sort_order,
    }));

    await supabase.from("quote_line_items").insert(lineItemRows);
    quotes.push(quote as Quote);
  }

  const totalAmount = quotes.reduce((sum, q) => sum + Number(q.total), 0);

  revalidatePath("/app/quotes");
  revalidatePath(`/app/releases/${data.release_id}`);

  return {
    schedule: {
      group_id: scheduleGroupId,
      release_id: data.release_id,
      installments: quotes,
      total_amount: totalAmount,
      paid_amount: 0,
      remaining_amount: totalAmount,
      is_fully_paid: false,
    },
  };
}

export async function getPaymentSchedule(
  scheduleGroupId: string,
): Promise<{ schedule: PaymentSchedule | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { schedule: null, error: "Not authenticated" };

  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("schedule_group_id", scheduleGroupId)
    .eq("user_id", user.id)
    .order("schedule_order");

  if (error) return { schedule: null, error: error.message };
  if (!quotes || quotes.length === 0)
    return { schedule: null, error: "Schedule not found" };

  const totalAmount = quotes.reduce((sum, q) => sum + Number(q.total), 0);
  const paidAmount = quotes
    .filter((q) => q.status === "paid")
    .reduce((sum, q) => sum + Number(q.total), 0);

  return {
    schedule: {
      group_id: scheduleGroupId,
      release_id: quotes[0].release_id,
      installments: quotes as Quote[],
      total_amount: totalAmount,
      paid_amount: paidAmount,
      remaining_amount: totalAmount - paidAmount,
      is_fully_paid: paidAmount >= totalAmount,
    },
  };
}

export async function sendPaymentSchedule(
  scheduleGroupId: string,
  options: { send_all?: boolean } = {},
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("schedule_group_id", scheduleGroupId)
    .eq("user_id", user.id)
    .eq("status", "draft")
    .order("schedule_order");

  if (!quotes || quotes.length === 0) return { error: "No draft quotes to send" };

  const toSend = options.send_all ? quotes : [quotes[0]];

  for (const quote of toSend) {
    const result = await sendQuote(quote.id);
    if (result.error) return result;
  }

  return {};
}
