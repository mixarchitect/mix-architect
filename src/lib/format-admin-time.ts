/**
 * Admin timestamp formatting.
 *
 * formatAdminTime renders in the runtime's local timezone. In client
 * components that is the viewer's timezone (the desired behavior for all
 * admin timestamps); in RSCs it is the server timezone, so server-rendered
 * timestamps should prefer relative time plus the UTC title tooltip.
 */
export function formatAdminTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return typeof iso === "string" ? iso : "";
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  });
}

/** UTC ISO string for use in a title= attribute alongside the local render. */
export function formatAdminTimeTitle(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return typeof iso === "string" ? iso : "";
  return d.toISOString();
}
