import type { MetadataRoute } from "next";
import { getFeaturedReleaseSlugs } from "@/lib/services/featured-releases";
import { getAllPublishedSlugs } from "@/lib/services/changelog";

const BASE_URL = "https://mixarchitect.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [featuredSlugs, changelogSlugs] = await Promise.all([
    getFeaturedReleaseSlugs(),
    getAllPublishedSlugs(),
  ]);

  const featuredUrls: MetadataRoute.Sitemap = featuredSlugs.map((slug) => ({
    url: `${BASE_URL}/featured/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const changelogUrls: MetadataRoute.Sitemap = changelogSlugs.map((slug) => ({
    url: `${BASE_URL}/changelog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/featured`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/changelog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...featuredUrls,
    ...changelogUrls,
  ];
}
