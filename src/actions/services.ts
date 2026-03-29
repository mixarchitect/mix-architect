"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Service, ServiceUnit } from "@/types/payments";

// ── Types ────────────────────────────────────────────────────────

type CreateServiceInput = {
  name: string;
  description?: string | null;
  default_rate: number;
  unit?: ServiceUnit;
};

type UpdateServiceInput = Partial<CreateServiceInput> & {
  sort_order?: number;
  is_active?: boolean;
};

// ── CRUD ─────────────────────────────────────────────────────────

export async function getServices(): Promise<{
  services: Service[];
  error?: string;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { services: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("sort_order");

  if (error) return { services: [], error: error.message };
  return { services: (data ?? []) as Service[] };
}

export async function createService(
  input: CreateServiceInput,
): Promise<{ service: Service | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { service: null, error: "Not authenticated" };

  if (!input.name?.trim()) {
    return { service: null, error: "Service name is required" };
  }
  if (input.default_rate < 0 || input.default_rate > 999999.99) {
    return { service: null, error: "Invalid rate" };
  }

  // Get the next sort_order
  const { data: last } = await supabase
    .from("services")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (last?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("services")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      description: input.description ?? null,
      default_rate: input.default_rate,
      unit: input.unit ?? "flat",
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) return { service: null, error: error.message };

  revalidatePath("/app/settings");
  return { service: data as Service };
}

export async function createServicesBulk(
  items: CreateServiceInput[],
): Promise<{ services: Service[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { services: [], error: "Not authenticated" };

  const { data: last } = await supabase
    .from("services")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startOrder = (last?.sort_order ?? -1) + 1;

  const rows = items.map((item, i) => ({
    user_id: user.id,
    name: item.name.trim(),
    description: item.description ?? null,
    default_rate: item.default_rate,
    unit: item.unit ?? "flat",
    sort_order: startOrder + i,
  }));

  const { data, error } = await supabase
    .from("services")
    .insert(rows)
    .select();

  if (error) return { services: [], error: error.message };

  revalidatePath("/app/settings");
  return { services: (data ?? []) as Service[] };
}

export async function updateService(
  serviceId: string,
  input: UpdateServiceInput,
): Promise<{ service: Service | null; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { service: null, error: "Not authenticated" };

  // Verify ownership
  const { data: existing } = await supabase
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { service: null, error: "Service not found" };

  const updateFields: Record<string, unknown> = {};
  if (input.name !== undefined) updateFields.name = input.name.trim();
  if (input.description !== undefined)
    updateFields.description = input.description;
  if (input.default_rate !== undefined)
    updateFields.default_rate = input.default_rate;
  if (input.unit !== undefined) updateFields.unit = input.unit;
  if (input.sort_order !== undefined) updateFields.sort_order = input.sort_order;
  if (input.is_active !== undefined) updateFields.is_active = input.is_active;

  const { data, error } = await supabase
    .from("services")
    .update(updateFields)
    .eq("id", serviceId)
    .select()
    .single();

  if (error) return { service: null, error: error.message };

  revalidatePath("/app/settings");
  return { service: data as Service };
}

export async function deleteService(
  serviceId: string,
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app/settings");
  return {};
}

export async function reorderServices(
  serviceIds: string[],
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await Promise.all(
    serviceIds.map((id, i) =>
      supabase
        .from("services")
        .update({ sort_order: i })
        .eq("id", id)
        .eq("user_id", user.id),
    ),
  );

  revalidatePath("/app/settings");
  return {};
}

export async function searchServices(
  query: string,
): Promise<{ services: Service[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { services: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .ilike("name", `%${query}%`)
    .order("sort_order")
    .limit(10);

  if (error) return { services: [], error: error.message };
  return { services: (data ?? []) as Service[] };
}
