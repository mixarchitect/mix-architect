import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChangelogBody({ body }: { body: string }) {
  return (
    <div
      className={[
        "prose prose-invert max-w-none",
        "prose-headings:text-text",
        "prose-p:text-muted",
        "prose-a:text-signal prose-a:no-underline hover:prose-a:underline",
        "prose-code:text-teal-300 prose-code:bg-panel2 prose-code:rounded prose-code:px-1",
        "prose-pre:bg-panel prose-pre:border prose-pre:border-border",
        "prose-strong:text-text",
        "prose-li:text-muted",
        "prose-img:rounded-xl prose-img:border prose-img:border-border",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
