"use server";

import { getFeaturedReleases } from "@/lib/services/featured-releases";
import type { FeaturedRelease } from "@/types/featured-release";

export async function loadMoreFeaturedReleases(
  page: number,
  genre?: string,
): Promise<FeaturedRelease[]> {
  const { releases } = await getFeaturedReleases(page, 12, genre);
  return releases;
}
