import { cn } from "@/lib/cn";
import { Timestamp } from "@/components/ui/timestamp";

type Props = {
  author: string;
  createdAt: string;
  content: string;
  className?: string;
  /** When true, the note is styled to indicate it came from a portal client */
  isClientNote?: boolean;
};

export function NoteEntry({ author, createdAt, content, className, isClientNote }: Props) {
  return (
    <div
      className={cn(
        "py-4",
        isClientNote && "pl-3 border-l-2 border-signal/40",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted mb-2">
        <span className="font-medium">{author}</span>
        {isClientNote && (
          <span className="text-[9px] font-medium text-signal bg-signal-muted px-1.5 py-0.5 rounded-full">
            Client
          </span>
        )}
        <span>&middot;</span>
        <Timestamp date={createdAt} />
      </div>
      <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}
