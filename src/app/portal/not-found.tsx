import { Link2Off } from "lucide-react";

/**
 * Shown for expired, disabled, or mistyped share links. Without this the
 * client saw the bare framework 404 and concluded their engineer sent a
 * broken link.
 */
export default function PortalNotFound() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-panel border border-border rounded-lg shadow p-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-panel2 flex items-center justify-center text-muted mb-4">
          <Link2Off size={22} />
        </div>
        <h1 className="text-lg font-semibold text-text">
          This link is no longer active
        </h1>
        <p className="mt-2 text-sm text-muted">
          The review portal you are looking for may have been turned off or
          replaced. Ask the person who sent it for a fresh link.
        </p>
      </div>
    </main>
  );
}
