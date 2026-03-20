/* ------------------------------------------------------------------ */
/*  Tour phase & step configuration                                    */
/* ------------------------------------------------------------------ */

export type AdvanceOn = "manual" | "input" | "click" | "navigate";
export type Position = "top" | "bottom" | "left" | "right";
export type Persona = "artist" | "engineer" | "both" | "other";

export type TourStep = {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: Position;
  advanceOn: AdvanceOn;
  /** For input advance: minimum characters before auto-advance */
  advanceThreshold?: number;
  /** Extra padding (px) around the spotlight cutout (default 8) */
  highlightPadding?: number;
  /** Restrict this step to specific personas (omit = show for all) */
  persona?: Persona[];
  /** URL pattern this step expects — used for cross-page sync */
  pagePattern?: string;
};

export type Phase = {
  id: string;
  label: string;
  description: string;
  steps: TourStep[];
  /** Route to navigate to when this phase becomes active (dynamic) */
  getRoute?: (ctx: { releaseId?: string; trackId?: string }) => string;
};

/* ------------------------------------------------------------------ */
/*  Phase 1: Create a Release                                          */
/* ------------------------------------------------------------------ */

const createReleaseSteps: TourStep[] = [
  {
    id: "create-title",
    targetSelector: '[data-tour="release-title"]',
    title: "Name your release",
    description:
      "We\u2019ve pre-filled some demo data to get you started. Feel free to change it!",
    position: "bottom",
    advanceOn: "input",
    advanceThreshold: 3,
    pagePattern: "/app/releases/new",
  },
  {
    id: "create-artist",
    targetSelector: '[data-tour="artist-name"]',
    title: "Artist / client name",
    description:
      "The performing artist or band. This appears on your release and can connect to the client portal.",
    position: "bottom",
    advanceOn: "input",
    advanceThreshold: 2,
    pagePattern: "/app/releases/new",
  },
  {
    id: "create-type",
    targetSelector: '[data-tour="release-type"]',
    title: "Release type",
    description:
      "Singles auto-create one track. EPs and albums let you add multiple tracks later.",
    position: "bottom",
    advanceOn: "click",
    pagePattern: "/app/releases/new",
  },
  {
    id: "create-format",
    targetSelector: '[data-tour="format"]',
    title: "Audio format",
    description:
      "Choose Stereo, Dolby Atmos, or both. This sets the target format for all tracks.",
    position: "bottom",
    advanceOn: "click",
    pagePattern: "/app/releases/new",
  },
  {
    id: "create-genres",
    targetSelector: '[data-tour="genre-tags"]',
    title: "Genre tags",
    description:
      "Tag your release with genres to help organize your catalog. This step is optional.",
    position: "bottom",
    advanceOn: "manual",
    pagePattern: "/app/releases/new",
  },
  {
    id: "create-submit",
    targetSelector: '[data-tour="create-submit"]',
    title: "Create your release",
    description:
      "Hit the button to create your release. We\u2019ll walk you through the result next.",
    position: "top",
    advanceOn: "navigate",
    highlightPadding: 4,
    pagePattern: "/app/releases/new",
  },
];

/* ------------------------------------------------------------------ */
/*  Phase 2: Explore Your Release                                      */
/* ------------------------------------------------------------------ */

const exploreReleaseSteps: TourStep[] = [
  {
    id: "release-tabs",
    targetSelector: '[data-tour="release-tabs"]',
    title: "Release tabs",
    description:
      "These tabs organize your release: Tracks, Globals, Distribution, and Financials. Each section helps manage a different aspect of your project.",
    position: "bottom",
    advanceOn: "manual",
    highlightPadding: 4,
  },
  {
    id: "release-sidebar",
    targetSelector: '[data-tour="release-sidebar"]',
    title: "Release details",
    description:
      "Upload cover art, view release info, and add internal or client notes here.",
    position: "left",
    advanceOn: "manual",
  },
  {
    id: "release-click-track",
    targetSelector: '[data-tour="track-link"]',
    title: "Explore a track",
    description:
      "Click into a track to see its details \u2014 mix intent, specs, audio versions, and more.",
    position: "bottom",
    advanceOn: "navigate",
    highlightPadding: 4,
  },
];

/* ------------------------------------------------------------------ */
/*  Phase 3: Track Details                                             */
/* ------------------------------------------------------------------ */

const trackDetailSteps: TourStep[] = [
  {
    id: "track-tabs",
    targetSelector: '[data-tour="track-tabs"]',
    title: "Track tabs",
    description:
      "Each tab captures a different aspect: Intent (your vision), Specs (technical requirements), Audio (uploads & versions), and more.",
    position: "bottom",
    advanceOn: "manual",
    highlightPadding: 4,
  },
  {
    id: "track-intent",
    targetSelector: '[data-tour="track-intent"]',
    title: "Mix vision",
    description:
      "Describe the vision for this mix \u2014 mood, references, and direction. This is the heart of your brief.",
    position: "bottom",
    advanceOn: "manual",
  },
];

/* ------------------------------------------------------------------ */
/*  Phase 4: Your Dashboard                                            */
/* ------------------------------------------------------------------ */

const dashboardSteps: TourStep[] = [
  {
    id: "dashboard-card",
    targetSelector: '[data-tour="release-card"]',
    title: "Your release card",
    description:
      "Each release shows its status, track progress, and key info at a glance. Click to dive back in.",
    position: "bottom",
    advanceOn: "manual",
    highlightPadding: 4,
  },
  {
    id: "dashboard-nav",
    targetSelector: 'nav[aria-label="App navigation"]',
    title: "Navigation",
    description:
      "The sidebar gives you quick access to all sections \u2014 Releases, Artists, Templates, Payments, and Analytics.",
    position: "right",
    advanceOn: "manual",
    highlightPadding: 4,
  },
  {
    id: "tour-complete",
    targetSelector: "[data-tour-complete]",
    title: "You\u2019re all set!",
    description:
      "You\u2019ve completed the guided tour. Explore at your own pace \u2014 you can always customize which features are visible in Settings.",
    position: "bottom",
    advanceOn: "manual",
  },
];

/* ------------------------------------------------------------------ */
/*  All phases                                                         */
/* ------------------------------------------------------------------ */

export const TOUR_PHASES: Phase[] = [
  {
    id: "create-release",
    label: "Create a Release",
    description: "Set up your first project",
    steps: createReleaseSteps,
    getRoute: () => "/app/releases/new?tour=true",
  },
  {
    id: "explore-release",
    label: "Explore Your Release",
    description: "Navigate tabs and sidebar",
    steps: exploreReleaseSteps,
    getRoute: (ctx) => (ctx.releaseId ? `/app/releases/${ctx.releaseId}` : "/app"),
  },
  {
    id: "track-detail",
    label: "Track Details",
    description: "Intent, specs, and audio",
    steps: trackDetailSteps,
    getRoute: (ctx) =>
      ctx.releaseId && ctx.trackId
        ? `/app/releases/${ctx.releaseId}/tracks/${ctx.trackId}`
        : "/app",
  },
  {
    id: "dashboard",
    label: "Your Dashboard",
    description: "Overview and navigation",
    steps: dashboardSteps,
    getRoute: () => "/app",
  },
];

/** Total number of steps across all phases */
export const TOTAL_TOUR_STEPS = TOUR_PHASES.reduce(
  (sum, p) => sum + p.steps.length,
  0,
);

/* ------------------------------------------------------------------ */
/*  Demo content per persona                                           */
/* ------------------------------------------------------------------ */

export type DemoContent = {
  title: string;
  artist: string | null; // null = use displayName
};

export function getDemoContent(
  persona: Persona | null,
): DemoContent {
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
