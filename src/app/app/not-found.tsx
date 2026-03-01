import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ background: "color-mix(in srgb, var(--muted) 15%, transparent)" }}>
        <FileQuestion className="w-6 h-6 text-muted" />
      </div>
      <h2 className="text-lg font-semibold text-text">Page not found</h2>
      <p className="text-sm text-muted max-w-md">
        This release or track doesn&apos;t exist, or you may not have access to
        it.
      </p>
      <Link href="/app">
        <Button variant="primary">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
