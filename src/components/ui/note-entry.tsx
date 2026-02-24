import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/relative-time";

type Props = {
  author: string;
  createdAt: string;
  content: string;
  className?: string;
};

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
