import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryById } from "@/lib/services/changelog-admin";
import { ChangelogEntryForm } from "../../changelog-entry-form";
import { updateChangelogEntryAction } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditChangelogEntryPage({ params }: Props) {
  const { id } = await params;
  const entry = await getEntryById(id);
  if (!entry) notFound();

  return (
    <div>
      <Link
        href="/admin/changelog"
        className="text-sm text-muted hover:text-text transition-colors"
      >
        &larr; Back to Changelog
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-text mb-8">
        Edit: {entry.title}
      </h1>
      <ChangelogEntryForm action={updateChangelogEntryAction} entry={entry} />
    </div>
  );
}
