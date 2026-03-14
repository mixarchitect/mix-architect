"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import {
  createFeaturedRelease,
  updateFeaturedRelease,
  deleteFeaturedRelease,
  setActiveFeaturedRelease,
  uploadCoverArt,
} from "@/lib/services/featured-releases-admin";

function revalidateAll(slug?: string) {
  revalidatePath("/");
  revalidatePath("/featured");
  revalidatePath("/app");
  revalidatePath("/admin/featured");
  if (slug) revalidatePath(`/featured/${slug}`);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function createFeaturedReleaseAction(formData: FormData) {
  await requireAdmin();

  const coverFile = formData.get("cover_art") as File | null;
  const slug = (formData.get("slug") as string) || slugify(formData.get("title") as string);

  let coverArtPath = "";
  if (coverFile && coverFile.size > 0) {
    coverArtPath = await uploadCoverArt(coverFile, slug);
  }

  const genreTags = (formData.get("genre_tags") as string)
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) ?? [];

  await createFeaturedRelease({
    slug,
    title: formData.get("title") as string,
    artist_name: formData.get("artist_name") as string,
    release_type: (formData.get("release_type") as "single" | "ep" | "album") || "album",
    source: (formData.get("source") as "platform" | "external") || "external",
    release_id: (formData.get("release_id") as string) || null,
    author_name: (formData.get("author_name") as string) || null,
    author_bio: (formData.get("author_bio") as string) || null,
    author_url: (formData.get("author_url") as string) || null,
    headline: formData.get("headline") as string,
    body: formData.get("body") as string,
    pull_quote: (formData.get("pull_quote") as string) || null,
    cover_art_path: coverArtPath,
    link_spotify: (formData.get("link_spotify") as string) || null,
    link_apple_music: (formData.get("link_apple_music") as string) || null,
    link_youtube_music: (formData.get("link_youtube_music") as string) || null,
    link_bandcamp: (formData.get("link_bandcamp") as string) || null,
    link_soundcloud: (formData.get("link_soundcloud") as string) || null,
    link_tidal: (formData.get("link_tidal") as string) || null,
    link_amazon_music: (formData.get("link_amazon_music") as string) || null,
    link_deezer: (formData.get("link_deezer") as string) || null,
    link_qobuz: (formData.get("link_qobuz") as string) || null,
    link_website: (formData.get("link_website") as string) || null,
    genre_tags: genreTags,
    credits: (formData.get("credits") as string) || null,
    release_date: (formData.get("release_date") as string) || null,
    featured_date: (formData.get("featured_date") as string) || new Date().toISOString().split("T")[0],
    is_active: formData.get("is_active") === "on",
    meta_title: (formData.get("meta_title") as string) || null,
    meta_description: (formData.get("meta_description") as string) || null,
  });

  revalidateAll(slug);
  redirect("/admin/featured");
}

export async function updateFeaturedReleaseAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;

  const coverFile = formData.get("cover_art") as File | null;
  let coverArtPath: string | undefined;
  if (coverFile && coverFile.size > 0) {
    coverArtPath = await uploadCoverArt(coverFile, slug);
  }

  const genreTags = (formData.get("genre_tags") as string)
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) ?? [];

  const updates: Record<string, unknown> = {
    slug,
    title: formData.get("title") as string,
    artist_name: formData.get("artist_name") as string,
    release_type: formData.get("release_type") as string,
    source: formData.get("source") as string,
    release_id: (formData.get("release_id") as string) || null,
    author_name: (formData.get("author_name") as string) || null,
    author_bio: (formData.get("author_bio") as string) || null,
    author_url: (formData.get("author_url") as string) || null,
    headline: formData.get("headline") as string,
    body: formData.get("body") as string,
    pull_quote: (formData.get("pull_quote") as string) || null,
    link_spotify: (formData.get("link_spotify") as string) || null,
    link_apple_music: (formData.get("link_apple_music") as string) || null,
    link_youtube_music: (formData.get("link_youtube_music") as string) || null,
    link_bandcamp: (formData.get("link_bandcamp") as string) || null,
    link_soundcloud: (formData.get("link_soundcloud") as string) || null,
    link_tidal: (formData.get("link_tidal") as string) || null,
    link_amazon_music: (formData.get("link_amazon_music") as string) || null,
    link_deezer: (formData.get("link_deezer") as string) || null,
    link_qobuz: (formData.get("link_qobuz") as string) || null,
    link_website: (formData.get("link_website") as string) || null,
    genre_tags: genreTags,
    credits: (formData.get("credits") as string) || null,
    release_date: (formData.get("release_date") as string) || null,
    featured_date: formData.get("featured_date") as string,
    is_active: formData.get("is_active") === "on",
    meta_title: (formData.get("meta_title") as string) || null,
    meta_description: (formData.get("meta_description") as string) || null,
  };

  if (coverArtPath) {
    updates.cover_art_path = coverArtPath;
  }

  await updateFeaturedRelease(id, updates);
  revalidateAll(slug);
  redirect("/admin/featured");
}

export async function deleteFeaturedReleaseAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  await deleteFeaturedRelease(id);
  revalidateAll(slug);
  redirect("/admin/featured");
}

export async function setActiveAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  await setActiveFeaturedRelease(id);
  revalidateAll(slug);
  redirect("/admin/featured");
}

export async function deactivateAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  await updateFeaturedRelease(id, { is_active: false });
  revalidateAll(slug);
  redirect("/admin/featured");
}
