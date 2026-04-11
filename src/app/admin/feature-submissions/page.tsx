import Link from "next/link";
import { getSubmissions } from "@/lib/services/feature-submissions-admin";
import { approveSubmissionAction, declineSubmissionAction } from "./actions";
import { SubmissionFilters } from "./submission-filters";

export default async function AdminFeatureSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const statusFilter = (typeof sp.status === "string" ? sp.status : "pending") as
    | "pending"
    | "approved"
    | "declined"
    | "all";

  const submissions = await getSubmissions(statusFilter);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-6">
        Feature Submissions
      </h1>

      <SubmissionFilters current={statusFilter} />

      {submissions.length === 0 ? (
        <div className="text-sm text-muted text-center py-16">
          No {statusFilter === "all" ? "" : statusFilter} submissions.
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 bg-panel border border-border rounded-lg"
            >
              <div className="flex items-start gap-4">
                {/* Cover art */}
                {sub.cover_art_url ? (
                  <img
                    src={sub.cover_art_url}
                    alt=""
                    className="w-14 h-14 rounded-md object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-md bg-zinc-800 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-medium text-text">
                      {sub.release_title}
                    </p>
                    <StatusPill status={sub.status} />
                  </div>
                  <p className="text-xs text-muted">{sub.artist_name}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {sub.track_count} {sub.track_count === 1 ? "track" : "tracks"} &middot;{" "}
                    {sub.release_type === "ep" ? "EP" : sub.release_type.charAt(0).toUpperCase() + sub.release_type.slice(1)}
                    {sub.submitter_name && <> &middot; Submitted by {sub.submitter_name}</>}
                    {" "}&middot;{" "}
                    {timeAgo(sub.created_at)}
                  </p>

                  {sub.pitch_note && (
                    <p className="text-xs text-zinc-400 italic mt-2 leading-relaxed">
                      &ldquo;{sub.pitch_note}&rdquo;
                    </p>
                  )}

                  {sub.genre_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sub.genre_tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/8 text-zinc-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Link
                    href={`/app/releases/${sub.release_id}`}
                    className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1"
                    target="_blank"
                  >
                    View Release
                  </Link>

                  {sub.status === "pending" && (
                    <>
                      <form action={approveSubmissionAction}>
                        <input type="hidden" name="id" value={sub.id} />
                        <button
                          type="submit"
                          className="text-xs text-teal-500 hover:text-teal-400 transition-colors px-2 py-1"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={declineSubmissionAction}>
                        <input type="hidden" name="id" value={sub.id} />
                        <button
                          type="submit"
                          className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-2 py-1"
                        >
                          Decline
                        </button>
                      </form>
                    </>
                  )}

                  {sub.status === "approved" && !sub.featured_release_id && (
                    <Link
                      href={`/admin/featured/new?from_submission=${sub.id}`}
                      className="text-xs text-teal-500 hover:text-teal-400 transition-colors px-2 py-1"
                    >
                      Create Feature Post
                    </Link>
                  )}

                  {sub.status === "approved" && sub.featured_release_id && (
                    <Link
                      href={`/admin/featured/${sub.featured_release_id}/edit`}
                      className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1"
                    >
                      View Feature
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "text-amber-500 border-amber-500/20 bg-amber-500/10",
    approved: "text-teal-500 border-teal-500/20 bg-teal-500/10",
    declined: "text-zinc-500 border-zinc-500/20 bg-zinc-500/10",
  };

  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${colors[status] ?? ""}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
