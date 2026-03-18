"use server";

import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import type { FeatureRequestAdmin, FeatureStatus } from "@/lib/help/types";

// ---------- Fetch all feature requests (admin view) ----------

export async function getAdminFeatureRequests(filters?: {
  status?: string;
  category?: string;
  tag?: string;
  search?: string;
  sort?: "votes" | "recency" | "status";
}): Promise<FeatureRequestAdmin[]> {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  let query = supabase
    .from("feature_requests")
    .select("*")
    .is("merged_into_id", null); // Only canonical (non-merged) requests

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.tag) {
    query = query.contains("tags", [filters.tag]);
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  switch (filters?.sort) {
    case "votes":
      query = query.order("vote_count", { ascending: false });
      break;
    case "status":
      query = query.order("status").order("vote_count", { ascending: false });
      break;
    case "recency":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const requestIds = rows.map((r: any) => r.id);

  // Get merge counts + summed votes for merged requests
  const { data: mergedData } = await supabase
    .from("feature_requests")
    .select("merged_into_id, vote_count")
    .in("merged_into_id", requestIds);

  const mergeMap = new Map<string, { count: number; votes: number }>();
  (mergedData ?? []).forEach((m: any) => {
    const existing = mergeMap.get(m.merged_into_id) ?? {
      count: 0,
      votes: 0,
    };
    mergeMap.set(m.merged_into_id, {
      count: existing.count + 1,
      votes: existing.votes + m.vote_count,
    });
  });

  // Get display names via the helper function
  const userIds = rows
    .map((r: any) => r.user_id)
    .filter(Boolean) as string[];
  const nameMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: users } = await supabase.auth.admin.listUsers();
    (users?.users ?? []).forEach((u: any) => {
      const name =
        u.user_metadata?.display_name ??
        u.user_metadata?.full_name ??
        u.email ??
        null;
      if (name) nameMap.set(u.id, name);
    });
  }

  return rows.map((r: any) => ({
    ...r,
    tags: r.tags ?? [],
    submitter_name: nameMap.get(r.user_id) ?? r.email ?? null,
    merge_count: mergeMap.get(r.id)?.count ?? 0,
    total_votes: r.vote_count + (mergeMap.get(r.id)?.votes ?? 0),
  }));
}

// ---------- Update feature request status ----------

export async function updateFeatureRequestStatus(
  requestId: string,
  status: FeatureStatus,
  adminResponse?: string
) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("feature_requests")
    .update({
      status,
      status_changed_at: new Date().toISOString(),
      ...(adminResponse !== undefined && { admin_response: adminResponse }),
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feature-requests");
  return { success: true };
}

// ---------- Bulk update status ----------

export async function bulkUpdateFeatureRequestStatus(
  requestIds: string[],
  status: FeatureStatus
) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("feature_requests")
    .update({
      status,
      status_changed_at: new Date().toISOString(),
    })
    .in("id", requestIds);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feature-requests");
  return { success: true };
}

// ---------- Update tags ----------

export async function updateFeatureRequestTags(
  requestId: string,
  tags: string[]
) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("feature_requests")
    .update({ tags })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feature-requests");
  return { success: true };
}

// ---------- Bulk add tags ----------

export async function bulkAddTags(requestIds: string[], tagsToAdd: string[]) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { data: current } = await supabase
    .from("feature_requests")
    .select("id, tags")
    .in("id", requestIds);

  for (const r of current ?? []) {
    const merged = [...new Set([...(r.tags ?? []), ...tagsToAdd])];
    await supabase
      .from("feature_requests")
      .update({ tags: merged })
      .eq("id", r.id);
  }

  revalidatePath("/admin/feature-requests");
  return { success: true };
}

// ---------- Merge requests ----------

export async function mergeFeatureRequests(
  canonicalId: string,
  duplicateIds: string[]
) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("feature_requests")
    .update({ merged_into_id: canonicalId })
    .in("id", duplicateIds);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feature-requests");
  return { success: true };
}

// ---------- Unmerge a request ----------

export async function unmergeFeatureRequest(requestId: string) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("feature_requests")
    .update({ merged_into_id: null })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feature-requests");
  return { success: true };
}

// ---------- Update admin notes ----------

export async function updateAdminNotes(requestId: string, adminNotes: string) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("feature_requests")
    .update({ admin_notes: adminNotes })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ---------- Update admin response (visible to users) ----------

export async function updateAdminResponse(
  requestId: string,
  adminResponse: string
) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("feature_requests")
    .update({ admin_response: adminResponse })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feature-requests");
  return { success: true };
}

// ---------- Get merged requests for a canonical request ----------

export async function getMergedRequests(canonicalId: string) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("feature_requests")
    .select("id, title, description, vote_count, created_at, email")
    .eq("merged_into_id", canonicalId)
    .order("vote_count", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ---------- Get all unique tags ----------

export async function getAllFeatureRequestTags(): Promise<string[]> {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("feature_requests")
    .select("tags");

  if (error) throw new Error(error.message);

  const allTags = new Set<string>();
  (data ?? []).forEach((r: any) => {
    (r.tags ?? []).forEach((t: string) => allTags.add(t));
  });

  return Array.from(allTags).sort();
}

// ---------- Delete feature request ----------

export async function deleteFeatureRequest(requestId: string) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  // First unmerge anything merged into this request
  await supabase
    .from("feature_requests")
    .update({ merged_into_id: null })
    .eq("merged_into_id", requestId);

  const { error } = await supabase
    .from("feature_requests")
    .delete()
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feature-requests");
  return { success: true };
}
