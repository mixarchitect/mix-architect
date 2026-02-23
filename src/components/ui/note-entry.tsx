import { cn } from "@/lib/cn";

type Props = {
  author: string;
  createdAt: string;
  content: string;
  className?: string;
};

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function NoteEntry({ author, createdAt, content, className }: Props) {
  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-2 text-xs text-muted mb-2">
        <span className="font-medium">{author}</span>
        <span>&middot;</span>
        <span>{relativeTime(createdAt)}</span>
      </div>
      <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}
