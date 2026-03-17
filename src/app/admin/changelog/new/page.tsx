import Link from "next/link";
import { ChangelogEntryForm } from "../changelog-entry-form";
import { createChangelogEntryAction } from "../actions";

export default function NewChangelogEntryPage() {
  return (
    <div>
      <Link
        href="/admin/changelog"
        className="text-sm text-muted hover:text-text transition-colors"
      >
        &larr; Back to Changelog
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-text mb-8">
        New Changelog Entry
      </h1>
      <ChangelogEntryForm action={createChangelogEntryAction} />
    </div>
  );
}
