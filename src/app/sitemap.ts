import type { MetadataRoute } from "next";
import { getFeaturedReleaseSlugs } from "@/lib/services/featured-releases";

const BASE_URL = "https://mixarchitect.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getFeaturedReleaseSlugs();

  const featuredUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/featured/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
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
    ...featuredUrls,
  ];
}
