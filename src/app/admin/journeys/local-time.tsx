"use client";

import { useEffect, useState } from "react";
import { formatAdminTime, formatAdminTimeTitle } from "@/lib/format-admin-time";

/**
 * Timestamp in the viewer's timezone. The server (UTC on Vercel) cannot
 * know that zone, so the first paint shows an explicit UTC time and the
 * local rendering replaces it after mount.
 */
export function LocalTime({ iso }: { iso: string }) {
  const [local, setLocal] = useState<string | null>(null);
  useEffect(() => {
    setLocal(formatAdminTime(iso));
  }, [iso]);
  return (
    <time dateTime={iso} title={formatAdminTimeTitle(iso)}>
      {local ?? `${iso.slice(0, 16).replace("T", " ")} UTC`}
    </time>
  );
}
