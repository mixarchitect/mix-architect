"use server";

import { requireAdmin } from "@/lib/admin";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { revalidatePath } from "next/cache";

export async function resolveSignal(signalId: string) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("admin_churn_signals")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", signalId);

  if (error) {
    throw new Error("Failed to resolve signal");
  }

  revalidatePath("/admin/churn");
}

export async function unresolveSignal(signalId: string) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("admin_churn_signals")
    .update({ resolved: false, resolved_at: null })
    .eq("id", signalId);

  if (error) {
    throw new Error("Failed to unresolve signal");
  }

  revalidatePath("/admin/churn");
}
