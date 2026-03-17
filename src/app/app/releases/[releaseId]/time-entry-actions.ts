"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { revalidatePath } from "next/cache";

export interface ReleaseTimeEntry {
  id: string;
  release_id: string;
  user_id: string;
  hours: number;
  rate: number | null;
  description: string | null;
  entry_type: "manual" | "timer";
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getTimeEntriesByRelease(
  releaseId: string,
): Promise<ReleaseTimeEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("release_time_entries")
    .select("*")
    .eq("release_id", releaseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[time-entries] Failed to fetch:", error.message);
    return [];
  }
  return (data ?? []) as ReleaseTimeEntry[];
}

export async function createTimeEntry(input: {
  releaseId: string;
  hours: number;
  rate?: number | null;
  description?: string;
  entryType: "manual" | "timer";
  startedAt?: string;
  endedAt?: string;
}): Promise<{ error?: string }> {
  if (!input.hours || input.hours <= 0) return { error: "Hours must be positive" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // If no rate provided, try to use default_hourly_rate
  let rate = input.rate;
  if (rate === undefined) {
    const { data: defaults } = await supabase
      .from("user_defaults")
      .select("default_hourly_rate")
      .eq("user_id", user.id)
      .maybeSingle();
    rate = defaults?.default_hourly_rate ?? null;
  }

  const { error } = await supabase.from("release_time_entries").insert({
    release_id: input.releaseId,
    user_id: user.id,
    hours: input.hours,
    rate,
    description: input.description?.trim() || null,
    entry_type: input.entryType,
    started_at: input.startedAt || null,
    ended_at: input.endedAt || null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/app/releases/${input.releaseId}`);
  return {};
}

export async function updateTimeEntry(input: {
  id: string;
  releaseId: string;
  hours?: number;
  rate?: number | null;
  description?: string | null;
}): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, unknown> = {};
  if (input.hours !== undefined) {
    if (input.hours <= 0) return { error: "Hours must be positive" };
    updates.hours = input.hours;
  }
  if (input.rate !== undefined) updates.rate = input.rate;
  if (input.description !== undefined) updates.description = input.description?.trim() || null;

  if (Object.keys(updates).length === 0) return {};

  const { error } = await supabase
    .from("release_time_entries")
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/app/releases/${input.releaseId}`);
  return {};
}

export async function deleteTimeEntry(
  timeEntryId: string,
  releaseId: string,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("release_time_entries")
    .delete()
    .eq("id", timeEntryId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/app/releases/${releaseId}`);
  return {};
}

export async function getUserDefaultRate(): Promise<number | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_defaults")
    .select("default_hourly_rate")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.default_hourly_rate ?? null;
}

export async function updateUserDefaultRate(rate: number | null): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_defaults")
    .upsert(
      { user_id: user.id, default_hourly_rate: rate },
      { onConflict: "user_id" },
    );

  if (error) return { error: error.message };
  revalidatePath("/app/settings");
  return {};
}
