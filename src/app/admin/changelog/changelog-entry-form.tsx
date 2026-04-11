"use client";

import { useState } from "react";
import type { ChangelogEntry, ChangelogCategory } from "@/types/changelog";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  return new Date(dateStr).toISOString().slice(0, 10);
}

export function ChangelogEntryForm({
  action,
  entry,
}: {
  action: (formData: FormData) => Promise<void>;
  entry?: ChangelogEntry;
}) {
  const [slug, setSlug] = useState(entry?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!entry);

  function handleTitleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (autoSlug) {
      setSlug(generateSlug(e.target.value));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setAutoSlug(false);
  }

  return (
    <form action={action} className="space-y-6 max-w-2xl">
      {entry && <input type="hidden" name="id" value={entry.id} />}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={entry?.title}
          onBlur={handleTitleBlur}
          className="mt-1 w-full rounded-lg border border-border bg-panel px-3 py-2 text-text placeholder:text-faint focus:border-signal focus:outline-none"
          placeholder="e.g., LUFS Measurement Now Targets 14+ Platforms"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-text">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={handleSlugChange}
          className="mt-1 w-full rounded-lg border border-border bg-panel px-3 py-2 text-text placeholder:text-faint focus:border-signal focus:outline-none"
        />
        <p className="mt-1 text-xs text-faint">
          mixarchitect.com/changelog/{slug || "..."}
        </p>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-text"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={entry?.category ?? "improvement"}
          className="mt-1 w-full rounded-lg border border-border bg-panel px-3 py-2 text-text focus:border-signal focus:outline-none"
        >
          <option value="feature">Feature</option>
          <option value="improvement">Improvement</option>
          <option value="fix">Fix</option>
          <option value="announcement">Announcement</option>
        </select>
      </div>

      {/* Summary */}
      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-text"
        >
          Summary
        </label>
        <input
          id="summary"
          name="summary"
          type="text"
          required
          maxLength={200}
          defaultValue={entry?.summary}
          className="mt-1 w-full rounded-lg border border-border bg-panel px-3 py-2 text-text placeholder:text-faint focus:border-signal focus:outline-none"
          placeholder="A 1-2 sentence plain text summary"
        />
        <p className="mt-1 text-xs text-faint">
          Shown on cards and in search results. Max 200 characters.
        </p>
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-text">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={12}
          defaultValue={entry?.body}
          className="mt-1 w-full rounded-lg border border-border bg-panel px-3 py-2 text-text placeholder:text-faint focus:border-signal focus:outline-none font-mono text-sm"
          placeholder="Supports Markdown: **bold**, *italic*, `code`, lists, headings, links, images."
        />
        <p className="mt-1 text-xs text-faint">
          Markdown supported. Use headings, lists, code blocks, links, and
          images.
        </p>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-text">
          Cover Image
        </label>
        <input
          id="cover_image_file"
          name="cover_image_file"
          type="file"
          accept="image/*"
          className="mt-1 text-sm text-zinc-400 file:mr-3 file:px-3 file:py-1.5 file:text-xs file:font-medium file:rounded-full file:border file:border-white/10 file:bg-panel file:text-zinc-300 file:cursor-pointer hover:file:bg-white/5"
        />
        <p className="mt-1 text-xs text-faint">
          Upload a screenshot or hero image. Or paste a URL below instead.
          {entry?.cover_image_path && (
            <> Current: <a href={entry.cover_image_path} target="_blank" rel="noopener noreferrer" className="text-signal hover:underline">view</a></>
          )}
        </p>
        <input
          id="cover_image_path"
          name="cover_image_path"
          type="text"
          defaultValue={entry?.cover_image_path ?? ""}
          className="mt-2 w-full rounded-lg border border-border bg-panel px-3 py-2 text-text placeholder:text-faint focus:border-signal focus:outline-none text-sm"
          placeholder="https://... (optional URL fallback)"
        />
      </div>

      {/* Video URL */}
      <div>
        <label
          htmlFor="video_url"
          className="block text-sm font-medium text-text"
        >
          Video URL
        </label>
        <input
          id="video_url"
          name="video_url"
          type="text"
          defaultValue={entry?.video_url ?? ""}
          className="mt-1 w-full rounded-lg border border-border bg-panel px-3 py-2 text-text placeholder:text-faint focus:border-signal focus:outline-none"
          placeholder="YouTube or Loom URL"
        />
      </div>

      {/* Version Tag */}
      <div>
        <label
          htmlFor="version_tag"
          className="block text-sm font-medium text-text"
        >
          Version Tag
        </label>
        <input
          id="version_tag"
          name="version_tag"
          type="text"
          maxLength={20}
          defaultValue={entry?.version_tag ?? ""}
          className="mt-1 w-full rounded-lg border border-border bg-panel px-3 py-2 text-text placeholder:text-faint focus:border-signal focus:outline-none"
          placeholder="e.g., v1.3 or March 2026"
        />
      </div>

      {/* Published Date */}
      <div>
        <label
          htmlFor="published_at"
          className="block text-sm font-medium text-text"
        >
          Published Date
        </label>
        <input
          id="published_at"
          name="published_at"
          type="date"
          required
          defaultValue={toDateInputValue(entry?.published_at)}
          className="mt-1 rounded-lg border border-border bg-panel px-3 py-2 text-text focus:border-signal focus:outline-none"
        />
        <p className="mt-1 text-xs text-faint">
          Display date. Can be backdated for historical entries.
        </p>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
          <input
            type="checkbox"
            name="is_highlighted"
            defaultChecked={entry?.is_highlighted ?? false}
            className="rounded border-border"
          />
          Highlighted (major update)
        </label>

        <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={entry?.is_published ?? false}
            className="rounded border-border"
          />
          Published
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="rounded-lg bg-signal px-6 py-2.5 text-sm font-medium text-signal-on transition-colors hover:opacity-90"
      >
        {entry ? "Save Changes" : "Create Entry"}
      </button>
    </form>
  );
}
