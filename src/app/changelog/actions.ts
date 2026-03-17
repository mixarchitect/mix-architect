"use server";

import { getPublishedEntries } from "@/lib/services/changelog";
import type { ChangelogEntryPublic } from "@/types/changelog";

export async function loadMoreChangelogEntries(
  page: number,
  pageSize: number,
): Promise<{ entries: ChangelogEntryPublic[]; totalCount: number }> {
  return getPublishedEntries(page, pageSize);
}
