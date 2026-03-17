import type { Metadata } from "next";
import { getPublishedEntries } from "@/lib/services/changelog";
import { ChangelogFeed } from "./changelog-feed";

export const metadata: Metadata = {
  title: "What's New — Mix Architect",
};

export default async function AppChangelogPage() {
  const { entries, totalCount } = await getPublishedEntries(1, 15);

  return (
    <div className="py-10 px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-text">What&apos;s New</h1>
        <p className="text-sm text-muted mt-1">
          The latest updates, features, and improvements to Mix Architect.
        </p>

        <ChangelogFeed
          initialEntries={entries}
          initialTotalCount={totalCount}
          basePath="/app/changelog"
        />
      </div>
    </div>
  );
}
