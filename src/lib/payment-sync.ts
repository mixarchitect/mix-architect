import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

/**
 * Syncs payment status between quotes and the linked release.
 * Runs after every payment (Stripe webhook or manual mark-as-paid).
 *
 * Logic:
 * - No non-cancelled quotes → leave release unchanged (manual tracking)
 * - All quotes paid → 'paid'
 * - Some paid → 'partial'
 * - None paid → 'unpaid'
 */
export async function syncPaymentStatus(releaseId: string): Promise<{
  paymentStatus: string;
  totalQuoted: number;
  totalPaid: number;
}> {
  const supabase = createSupabaseServiceClient();

  // Fetch all non-cancelled quotes for this release
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, total, status")
    .eq("release_id", releaseId)
    .neq("status", "cancelled");

  if (!quotes || quotes.length === 0) {
    return { paymentStatus: "no_fee", totalQuoted: 0, totalPaid: 0 };
  }

  const totalQuoted = quotes.reduce(
    (sum, q) => sum + Number(q.total),
    0,
  );
  const totalPaid = quotes
    .filter((q) => q.status === "paid")
    .reduce((sum, q) => sum + Number(q.total), 0);

  let paymentStatus: string;
  if (totalPaid >= totalQuoted) {
    paymentStatus = "paid";
  } else if (totalPaid > 0) {
    paymentStatus = "partial";
  } else {
    paymentStatus = "unpaid";
  }

  // Update the release
  await supabase
    .from("releases")
    .update({
      payment_status: paymentStatus,
      fee_total: totalQuoted,
      paid_amount: totalPaid,
    })
    .eq("id", releaseId);

  return { paymentStatus, totalQuoted, totalPaid };
}
