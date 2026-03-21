/* ------------------------------------------------------------------ */
/*  Tour topic & step configuration                                    */
/*  Each topic is tied to a page. Tooltips show the first time you     */
/*  visit that page while the tour is active. No auto-navigation.      */
/* ------------------------------------------------------------------ */

export type Position = "top" | "bottom" | "left" | "right";

export type TourStep = {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: Position;
  /** Extra padding (px) around the spotlight cutout (default 8) */
  highlightPadding?: number;
};

export type TourTopic = {
  id: string;
  label: string;
  description: string;
  /** Return true if this topic should activate on the given pathname */
  matchPage: (pathname: string) => boolean;
  /** Route to navigate to when user clicks this topic in the checklist */
  getRoute: (ctx: { releaseId?: string; trackId?: string }) => string | null;
  /** Tooltip steps shown sequentially on the matched page */
  steps: TourStep[];
};

/* ------------------------------------------------------------------ */
/*  Topics                                                             */
/* ------------------------------------------------------------------ */

export const TOUR_TOPICS: TourTopic[] = [
  {
    id: "create-release",
    label: "Create a Release",
    description: "Set up your first project",
    matchPage: (p) => p === "/app/releases/new",
    getRoute: () => "/app/releases/new",
    steps: [
      {
        id: "create-title",
        targetSelector: '[data-tour="release-title"]',
        title: "Name your release",
        description: "Give your project a working title. You can always change it later.",
        position: "bottom",
      },
      {
        id: "create-artist",
        targetSelector: '[data-tour="artist-name"]',
        title: "Artist / client name",
        description:
          "The performing artist or band. This appears on your release and can connect to the client portal.",
        position: "bottom",
      },
      {
        id: "create-type",
        targetSelector: '[data-tour="release-type"]',
        title: "Release type",
        description:
          "Singles auto-create one track. EPs and albums let you add multiple tracks later.",
        position: "bottom",
      },
      {
        id: "create-format",
        targetSelector: '[data-tour="format"]',
        title: "Audio format",
        description:
          "Choose Stereo, Dolby Atmos, or both. This sets the target format for all tracks.",
        position: "bottom",
      },
      {
        id: "create-genres",
        targetSelector: '[data-tour="genre-tags"]',
        title: "Genre tags",
        description:
          "Tag your release with genres to help organize your catalog. You can pick from the suggestions or type in any genre you like to create your own. This step is optional.",
        position: "bottom",
      },
      {
        id: "create-date",
        targetSelector: '[data-tour="release-date"]',
        title: "Target release date",
        description:
          "Set a target date for your release. This helps you track your timeline and keep things on schedule.",
        position: "bottom",
      },
      {
        id: "create-submit",
        targetSelector: '[data-tour="create-submit"]',
        title: "Create your release",
        description:
          "Hit the button to create your release. You\u2019ll be able to explore it right away.",
        position: "top",
        highlightPadding: 4,
      },
    ],
  },
  {
    id: "release-overview",
    label: "Explore Your Release",
    description: "Navigate tabs and sidebar",
    matchPage: (p) =>
      p.startsWith("/app/releases/") &&
      !p.includes("/new") &&
      !p.includes("/tracks/") &&
      !p.includes("/settings"),
    getRoute: (ctx) =>
      ctx.releaseId ? `/app/releases/${ctx.releaseId}` : null,
    steps: [
      {
        id: "release-tabs",
        targetSelector: '[data-tour="release-tabs"]',
        title: "Release tabs",
        description:
          "These tabs organize your release: Tracks, Globals, Distribution, and Financials. Each section helps manage a different aspect of your project.",
        position: "bottom",
        highlightPadding: 4,
      },
      {
        id: "release-sidebar",
        targetSelector: '[data-tour="release-sidebar"]',
        title: "Release details",
        description:
          "Upload cover art, view release info, and add internal or client notes here.",
        position: "left",
      },
      {
        id: "release-track-link",
        targetSelector: '[data-tour="track-link"]',
        title: "Explore a track",
        description:
          "Click into a track to see its details \u2014 mix intent, specs, audio versions, and more.",
        position: "bottom",
        highlightPadding: 4,
      },
    ],
  },
  {
    id: "track-detail",
    label: "Track Details",
    description: "Intent, specs, and audio",
    matchPage: (p) => p.includes("/tracks/"),
    getRoute: (ctx) =>
      ctx.releaseId && ctx.trackId
        ? `/app/releases/${ctx.releaseId}/tracks/${ctx.trackId}`
        : ctx.releaseId
          ? `/app/releases/${ctx.releaseId}`
          : null,
    steps: [
      {
        id: "track-tabs",
        targetSelector: '[data-tour="track-tabs"]',
        title: "Track tabs",
        description:
          "Each tab captures a different aspect: Intent (your vision), Specs (technical requirements), Audio (uploads & versions), and more.",
        position: "bottom",
        highlightPadding: 4,
      },
      {
        id: "track-intent",
        targetSelector: '[data-tour="track-intent"]',
        title: "Mix vision",
        description:
          "Describe the vision for this mix \u2014 mood, references, and direction. This is the heart of your brief.",
        position: "bottom",
      },
    ],
  },
  {
    id: "dashboard",
    label: "Your Dashboard",
    description: "Overview and navigation",
    matchPage: (p) => p === "/app",
    getRoute: () => "/app",
    steps: [
      {
        id: "dashboard-card",
        targetSelector: '[data-tour="release-card"]',
        title: "Your release card",
        description:
          "Each release shows its status, track progress, and key info at a glance. Click to dive back in.",
        position: "bottom",
        highlightPadding: 4,
      },
      {
        id: "dashboard-nav",
        targetSelector: 'nav[aria-label="App navigation"]',
        title: "Navigation",
        description:
          "The sidebar gives you quick access to all sections \u2014 Releases, Artists, Templates, Payments, and Analytics.",
        position: "right",
        highlightPadding: 4,
      },
    ],
  },
];

/** Total steps across all topics */
export const TOTAL_TOUR_STEPS = TOUR_TOPICS.reduce(
  (sum, t) => sum + t.steps.length,
  0,
);

/* ------------------------------------------------------------------ */
/*  Demo content per persona                                           */
/* ------------------------------------------------------------------ */

export type Persona = "artist" | "engineer" | "both" | "other";

export type DemoContent = {
  title: string;
  artist: string | null;
};

export function getDemoContent(persona: Persona | null): DemoContent {
  switch (persona) {
    case "artist":
      return { title: "Midnight Drive EP", artist: null };
    case "engineer":
      return { title: "Client Mix Session", artist: "Alex Rivera" };
    case "both":
      return { title: "Neon Skyline EP", artist: null };
    default:
      return { title: "My First Release", artist: "" };
  }
}
