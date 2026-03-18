"use server";

import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import type { ChangelogSuggester } from "@/lib/help/types";
import { logAdminAction } from "@/lib/admin-audit-logger";

// ---------- Link feature requests to changelog entry ----------

export async function linkFeatureRequestsToChangelog(
  changelogEntryId: string,
  featureRequestIds: string[]
) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const links = featureRequestIds.map((frId) => ({
    feature_request_id: frId,
    changelog_entry_id: changelogEntryId,
  }));

  const { error: linkError } = await supabase
    .from("feature_request_changelog_links")
    .upsert(links, {
      onConflict: "feature_request_id,changelog_entry_id",
    });

  if (linkError) throw new Error(linkError.message);

  // Also update linked feature requests to 'shipped'
  const { error: statusError } = await supabase
    .from("feature_requests")
    .update({
      status: "shipped",
      status_changed_at: new Date().toISOString(),
    })
    .in("id", featureRequestIds);

  if (statusError) throw new Error(statusError.message);

  revalidatePath("/admin/changelog");
  revalidatePath("/admin/feature-requests");
  return { success: true };
}

// ---------- Unlink feature request from changelog entry ----------

export async function unlinkFeatureRequestFromChangelog(
  changelogEntryId: string,
  featureRequestId: string
) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("feature_request_changelog_links")
    .delete()
    .eq("changelog_entry_id", changelogEntryId)
    .eq("feature_request_id", featureRequestId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/changelog");
  return { success: true };
}

// ---------- Get linked feature requests for a changelog entry ----------

export async function getLinkedFeatureRequests(changelogEntryId: string) {
  await requireAdmin();
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("feature_request_changelog_links")
    .select("feature_request_id")
    .eq("changelog_entry_id", changelogEntryId);

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) return [];

  const ids = data.map((d: any) => d.feature_request_id);
  const { data: requests } = await supabase
    .from("feature_requests")
    .select("id, title, vote_count, email, category")
    .in("id", ids);

  return requests ?? [];
}

// ---------- Get suggesters for a changelog entry (public) ----------

export async function getChangelogSuggesters(
  changelogEntryId: string
): Promise<ChangelogSuggester[]> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("changelog_suggesters")
    .select("*")
    .eq("changelog_entry_id", changelogEntryId);

  if (error) return [];
  return (data ?? []) as ChangelogSuggester[];
}

// ---------- Get shipped request → changelog links (for user board) ----------

export async function getShippedRequestChangelogLinks(requestIds: string[]) {
  if (requestIds.length === 0) return [];
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("feature_request_changelog_links")
    .select(
      "feature_request_id, changelog_entry_id, changelog_entries ( slug, title )"
    )
    .in("feature_request_id", requestIds);

  if (error) return [];
  return data ?? [];
}
