export type TourStep = {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
};

const COMMON_STEPS: TourStep[] = [
  {
    id: "release-title",
    targetSelector: '[data-onboarding="release-title"]',
    title: "Name your release",
    description:
      "Give your project a working title. You can always change this later.",
    position: "bottom",
  },
  {
    id: "artist-name",
    targetSelector: '[data-onboarding="artist-name"]',
    title: "Artist name",
    description:
      "The performing artist or band. This appears on your release and in the client portal.",
    position: "bottom",
  },
  {
    id: "release-type",
    targetSelector: '[data-onboarding="release-type"]',
    title: "Release type",
    description:
      "Singles auto-create one track. EPs and albums let you add multiple tracks.",
    position: "bottom",
  },
  {
    id: "format",
    targetSelector: '[data-onboarding="format"]',
    title: "Audio format",
    description:
      "Choose Stereo, Dolby Atmos, or both. This sets the target format for all tracks.",
    position: "bottom",
  },
];

const ARTIST_EXTRA: TourStep[] = [
  {
    id: "genre-tags",
    targetSelector: '[data-onboarding="genre-tags"]',
    title: "Genre tags",
    description:
      "Tag your release with genres to help organize your catalog.",
    position: "bottom",
  },
];

const ENGINEER_EXTRA: TourStep[] = [
  {
    id: "artist-client",
    targetSelector: '[data-onboarding="artist-name"]',
    title: "Client / artist name",
    description:
      "Enter the client or artist you're working for. This connects to the client portal.",
    position: "bottom",
  },
];

export function getTourSteps(
  persona: "artist" | "engineer" | "both" | "other",
): TourStep[] {
  if (persona === "artist") return [...COMMON_STEPS, ...ARTIST_EXTRA];
  if (persona === "engineer") {
    // Replace the generic artist step with the client-focused one
    const steps = COMMON_STEPS.filter((s) => s.id !== "artist-name");
    return [...steps, ...ENGINEER_EXTRA];
  }
  return [...COMMON_STEPS];
}
