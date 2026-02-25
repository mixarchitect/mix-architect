/**
 * Role-based permission helpers for release collaboration.
 *
 * Three permission tiers:
 *   Owner-only:           payment editing, team management, delete release
 *   Owner + Collaborator: release metadata, cover art, direction, status, specs, tracks, settings, share links
 *   All roles (creative): references, intent, elements, notes
 */

export type ReleaseRole = "owner" | "collaborator" | "client" | null;

/** Owner or collaborator — for release metadata, cover art, direction, status, specs, tracks */
export function canEdit(role: ReleaseRole): boolean {
  return role === "owner" || role === "collaborator";
}

/** Any role — for references, intent, elements, notes (creative input) */
export function canEditCreative(role: ReleaseRole): boolean {
  return role !== null;
}

/** Owner only — for payment status, fee, paid amount */
export function canEditPayment(role: ReleaseRole): boolean {
  return role === "owner";
}

/** Owner only — for inviting/removing team members */
export function canManageTeam(role: ReleaseRole): boolean {
  return role === "owner";
}

/** Owner only — for deleting a release */
export function canDeleteRelease(role: ReleaseRole): boolean {
  return role === "owner";
}
