"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { revalidatePath } from "next/cache";

export interface ReleaseExpense {
  id: string;
  release_id: string;
  user_id: string;
  description: string;
  amount: number;
  paid_by: string | null;
  owed_by: string | null;
  created_at: string;
  updated_at: string;
}

export async function getExpensesByRelease(
  releaseId: string,
): Promise<ReleaseExpense[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("release_expenses")
    .select("*")
    .eq("release_id", releaseId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[expenses] Failed to fetch:", error.message);
    return [];
  }
  return (data ?? []) as ReleaseExpense[];
}

export async function createExpense(input: {
  releaseId: string;
  description: string;
  amount: number;
  paidBy?: string;
  owedBy?: string;
}): Promise<{ error?: string }> {
  if (!input.description.trim()) return { error: "Description is required" };
  if (!input.amount || input.amount <= 0) return { error: "Amount must be positive" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("release_expenses").insert({
    release_id: input.releaseId,
    user_id: user.id,
    description: input.description.trim(),
    amount: input.amount,
    paid_by: input.paidBy?.trim() || null,
    owed_by: input.owedBy?.trim() || null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/app/releases/${input.releaseId}`);
  return {};
}

export async function updateExpense(input: {
  id: string;
  releaseId: string;
  description?: string;
  amount?: number;
  paidBy?: string | null;
  owedBy?: string | null;
}): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, unknown> = {};
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.amount !== undefined) {
    if (input.amount <= 0) return { error: "Amount must be positive" };
    updates.amount = input.amount;
  }
  if (input.paidBy !== undefined) updates.paid_by = input.paidBy?.trim() || null;
  if (input.owedBy !== undefined) updates.owed_by = input.owedBy?.trim() || null;

  if (Object.keys(updates).length === 0) return {};

  const { error } = await supabase
    .from("release_expenses")
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/app/releases/${input.releaseId}`);
  return {};
}

export async function deleteExpense(
  expenseId: string,
  releaseId: string,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("release_expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/app/releases/${releaseId}`);
  return {};
}
