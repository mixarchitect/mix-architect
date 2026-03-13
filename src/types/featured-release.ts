export interface FeaturedRelease {
  id: string;
  slug: string;
  title: string;
  artist_name: string;
  release_type: "single" | "ep" | "album";
  source: "platform" | "external";
  release_id: string | null;
  author_name: string | null;
  author_bio: string | null;
  author_url: string | null;
  headline: string;
  body: string;
  pull_quote: string | null;
  cover_art_path: string;
  link_spotify: string | null;
  link_apple_music: string | null;
  link_youtube_music: string | null;
  link_bandcamp: string | null;
  link_soundcloud: string | null;
  link_tidal: string | null;
  link_amazon_music: string | null;
  link_deezer: string | null;
  link_qobuz: string | null;
  link_website: string | null;
  genre_tags: string[];
  credits: string | null;
  release_date: string | null;
  featured_date: string;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreamingLink {
  platform: string;
  url: string;
  icon: string;
}

const STREAMING_PLATFORMS: {
  key: keyof FeaturedRelease;
  platform: string;
  icon: string;
}[] = [
  { key: "link_spotify", platform: "Spotify", icon: "spotify" },
  { key: "link_apple_music", platform: "Apple Music", icon: "apple" },
  { key: "link_youtube_music", platform: "YouTube Music", icon: "youtube" },
  { key: "link_bandcamp", platform: "Bandcamp", icon: "bandcamp" },
  { key: "link_soundcloud", platform: "SoundCloud", icon: "soundcloud" },
  { key: "link_tidal", platform: "Tidal", icon: "tidal" },
  { key: "link_amazon_music", platform: "Amazon Music", icon: "amazon" },
  { key: "link_deezer", platform: "Deezer", icon: "deezer" },
  { key: "link_qobuz", platform: "Qobuz", icon: "qobuz" },
  { key: "link_website", platform: "Website", icon: "globe" },
];

export function getStreamingLinks(release: FeaturedRelease): StreamingLink[] {
  return STREAMING_PLATFORMS.filter((p) => release[p.key]).map((p) => ({
    platform: p.platform,
    url: release[p.key] as string,
    icon: p.icon,
  }));
}

export function getCoverArtUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/featured-releases/${path}`;
}
