"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { togglePublishedAction, deleteChangelogEntryAction } from "./actions";
import type { ChangelogEntry } from "@/types/changelog";

export function ChangelogAdminActions({ entry }: { entry: ChangelogEntry }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleTogglePublished() {
    const formData = new FormData();
    formData.set("id", entry.id);
    startTransition(() => togglePublishedAction(formData));
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", entry.id);
    formData.set("title", entry.title);
    startTransition(() => deleteChangelogEntryAction(formData));
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <Link
        href={`/admin/changelog/${entry.id}/edit`}
        className="text-sm text-muted hover:text-text transition-colors"
      >
        Edit
      </Link>

      <button
        onClick={handleTogglePublished}
        disabled={isPending}
        className="text-sm text-muted hover:text-text transition-colors disabled:opacity-50"
      >
        {entry.is_published ? "Unpublish" : "Publish"}
      </button>

      {showConfirm ? (
        <span className="flex items-center gap-2 text-sm">
          <span className="text-orange-400">Delete?</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50"
          >
            Yes
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="text-muted hover:text-text transition-colors"
          >
            No
          </button>
        </span>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-sm text-muted hover:text-orange-400 transition-colors"
        >
          Delete
        </button>
      )}

      <Link
        href={`/changelog/${entry.slug}`}
        target="_blank"
        className="ml-auto text-sm text-faint hover:text-muted transition-colors"
      >
        View →
      </Link>
    </div>
  );
}
