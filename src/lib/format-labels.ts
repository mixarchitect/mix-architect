/** Display label for the mix format stored in the DB (stereo | atmos | both). */
export function formatLabel(f: string | undefined | null): string {
  if (!f || f === "stereo") return "Stereo";
  if (f === "atmos") return "Dolby Atmos";
  if (f === "both") return "Stereo + Atmos";
  return "Stereo";
}
