"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { WorkflowTrigger } from "@/types/payments";

export async function getWorkflowTriggers(): Promise<{
  triggers: WorkflowTrigger[];
  error?: string;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { triggers: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("workflow_triggers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

  if (error) return { triggers: [], error: error.message };
  return { triggers: (data ?? []) as WorkflowTrigger[] };
}

export async function toggleWorkflowTrigger(
  triggerId: string,
  enabled: boolean,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("workflow_triggers")
    .update({ enabled })
    .eq("id", triggerId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/app/settings");
  return {};
}

export async function createWorkflowTrigger(data: {
  trigger_event: string;
  action_type: string;
  release_id?: string | null;
  config?: Record<string, unknown>;
}): Promise<{ trigger: WorkflowTrigger | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { trigger: null, error: "Not authenticated" };

  const { data: trigger, error } = await supabase
    .from("workflow_triggers")
    .insert({
      user_id: user.id,
      trigger_event: data.trigger_event,
      action_type: data.action_type,
      release_id: data.release_id ?? null,
      config: data.config ?? {},
      enabled: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { trigger: null, error: "This automation already exists" };
    }
    return { trigger: null, error: error.message };
  }

  revalidatePath("/app/settings");
  return { trigger: trigger as WorkflowTrigger };
}

export async function deleteWorkflowTrigger(
  triggerId: string,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("workflow_triggers")
    .delete()
    .eq("id", triggerId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/app/settings");
  return {};
}

export async function getWorkflowLog(limit = 20): Promise<{
  log: {
    id: string;
    trigger_event: string;
    action_type: string;
    status: string;
    executed_at: string;
    details: Record<string, unknown>;
  }[];
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { log: [] };

  const { data } = await supabase
    .from("workflow_trigger_log")
    .select("id, trigger_event, action_type, status, executed_at, details")
    .eq("user_id", user.id)
    .order("executed_at", { ascending: false })
    .limit(limit);

  return { log: (data ?? []) as typeof data & [] };
}
