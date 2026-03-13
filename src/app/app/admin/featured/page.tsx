import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getAllFeaturedReleasesAdmin } from "@/lib/services/featured-releases-admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  deleteFeaturedReleaseAction,
  setActiveAction,
  deactivateAction,
} from "./actions";

export default async function AdminFeaturedPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.OWNER_USER_ID) {
    redirect("/app");
  }

  const releases = await getAllFeaturedReleasesAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-text">
          Featured Releases — Admin
        </h1>
        <Link href="/app/admin/featured/new">
          <Button variant="primary">
            <Plus size={16} />
            New Featured Release
          </Button>
        </Link>
      </div>

      {releases.length === 0 ? (
        <div className="text-sm text-muted text-center py-16">
          No featured releases yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {releases.map((release) => (
            <div
              key={release.id}
              className="flex items-center gap-4 p-4 bg-panel border border-border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {release.is_active && (
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  )}
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-white/10 text-zinc-500 uppercase tracking-wider">
                    {release.source}
                  </span>
                  {release.is_active && (
                    <span className="text-[10px] font-medium text-green-400">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-text truncate">
                  &ldquo;{release.title}&rdquo; by {release.artist_name}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Featured{" "}
                  {new Date(release.featured_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {release.author_name !== "Mix Architect" && (
                    <> &middot; By {release.author_name} (guest)</>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/app/admin/featured/${release.id}/edit`}
                  className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1"
                >
                  Edit
                </Link>

                {release.is_active ? (
                  <form action={deactivateAction}>
                    <input type="hidden" name="id" value={release.id} />
                    <input type="hidden" name="slug" value={release.slug} />
                    <button
                      type="submit"
                      className="text-xs text-zinc-400 hover:text-orange-400 transition-colors px-2 py-1"
                    >
                      Deactivate
                    </button>
                  </form>
                ) : (
                  <form action={setActiveAction}>
                    <input type="hidden" name="id" value={release.id} />
                    <input type="hidden" name="slug" value={release.slug} />
                    <button
                      type="submit"
                      className="text-xs text-teal-500 hover:text-teal-400 transition-colors px-2 py-1"
                    >
                      Set Active
                    </button>
                  </form>
                )}

                <form action={deleteFeaturedReleaseAction}>
                  <input type="hidden" name="id" value={release.id} />
                  <input type="hidden" name="slug" value={release.slug} />
                  <button
                    type="submit"
                    className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-2 py-1"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
