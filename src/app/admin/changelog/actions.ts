"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import {
  createEntry,
  updateEntry,
  deleteEntry,
  togglePublished,
  generateSlug,
} from "@/lib/services/changelog-admin";
import { logAdminAction } from "@/lib/admin-audit-logger";
import type { ChangelogCategory } from "@/types/changelog";

function revalidateChangelog() {
  revalidatePath("/changelog");
  revalidatePath("/admin/changelog");
}

export async function createChangelogEntryAction(formData: FormData) {
  const adminId = await requireAdmin();

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || generateSlug(title);
  const category = formData.get("category") as ChangelogCategory;
  const summary = formData.get("summary") as string;
  const body = formData.get("body") as string;
  const cover_image_path = (formData.get("cover_image_path") as string) || null;
  const video_url = (formData.get("video_url") as string) || null;
  const version_tag = (formData.get("version_tag") as string) || null;
  const published_at = formData.get("published_at") as string;
  const is_highlighted = formData.get("is_highlighted") === "on";
  const is_published = formData.get("is_published") === "on";

  const entry = await createEntry({
    title,
    slug,
    category,
    summary,
    body,
    cover_image_path,
    video_url,
    version_tag,
    published_at: new Date(published_at).toISOString(),
    is_highlighted,
    is_published,
  });

  if (!entry) {
    throw new Error("Failed to create changelog entry");
  }

  logAdminAction(adminId, "changelog.create", {
    entryId: entry.id,
    title: entry.title,
  });

  revalidateChangelog();
  redirect("/admin/changelog");
}

export async function updateChangelogEntryAction(formData: FormData) {
  const adminId = await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || generateSlug(title);
  const category = formData.get("category") as ChangelogCategory;
  const summary = formData.get("summary") as string;
  const body = formData.get("body") as string;
  const cover_image_path = (formData.get("cover_image_path") as string) || null;
  const video_url = (formData.get("video_url") as string) || null;
  const version_tag = (formData.get("version_tag") as string) || null;
  const published_at = formData.get("published_at") as string;
  const is_highlighted = formData.get("is_highlighted") === "on";
  const is_published = formData.get("is_published") === "on";

  const entry = await updateEntry(id, {
    title,
    slug,
    category,
    summary,
    body,
    cover_image_path,
    video_url,
    version_tag,
    published_at: new Date(published_at).toISOString(),
    is_highlighted,
    is_published,
  });

  if (!entry) {
    throw new Error("Failed to update changelog entry");
  }

  logAdminAction(adminId, "changelog.update", {
    entryId: entry.id,
    title: entry.title,
  });

  revalidateChangelog();
  redirect("/admin/changelog");
}

export async function deleteChangelogEntryAction(formData: FormData) {
  const adminId = await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;

  const success = await deleteEntry(id);
  if (!success) {
    throw new Error("Failed to delete changelog entry");
  }

  logAdminAction(adminId, "changelog.delete", { entryId: id, title });

  revalidateChangelog();
  redirect("/admin/changelog");
}

export async function togglePublishedAction(formData: FormData) {
  const adminId = await requireAdmin();

  const id = formData.get("id") as string;

  const entry = await togglePublished(id);
  if (!entry) {
    throw new Error("Failed to toggle published status");
  }

  logAdminAction(adminId, "changelog.toggle_published", {
    entryId: entry.id,
    title: entry.title,
    is_published: entry.is_published,
  });

  revalidateChangelog();
}
