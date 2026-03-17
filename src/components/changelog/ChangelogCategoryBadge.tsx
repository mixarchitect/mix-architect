import { cn } from "@/lib/cn";
import type { ChangelogCategory } from "@/types/changelog";

const categoryStyles: Record<ChangelogCategory, string> = {
  feature: "bg-teal-600/20 text-teal-400 border-teal-600/40",
  improvement: "bg-blue-600/20 text-blue-400 border-blue-600/40",
  fix: "bg-orange-600/20 text-orange-400 border-orange-600/40",
  announcement: "bg-purple-600/20 text-purple-400 border-purple-600/40",
};

const categoryLabels: Record<ChangelogCategory, string> = {
  feature: "Feature",
  improvement: "Improvement",
  fix: "Fix",
  announcement: "Announcement",
};

export function ChangelogCategoryBadge({
  category,
  className,
}: {
  category: ChangelogCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        categoryStyles[category],
        className,
      )}
    >
      {categoryLabels[category]}
    </span>
  );
}
