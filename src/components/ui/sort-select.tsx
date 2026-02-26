"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "modified", label: "Last Modified" },
  { value: "created", label: "Last Created" },
  { value: "az", label: "A \u2013 Z" },
] as const;

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "modified";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "modified") {
      params.delete("sort"); // default — keep URL clean
    } else {
      params.set("sort", value);
    }
    const qs = params.toString();
    router.push(qs ? `/app?${qs}` : "/app");
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs text-muted bg-transparent border border-border rounded-md px-2 py-1.5 outline-none focus:border-signal transition-colors cursor-pointer"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
