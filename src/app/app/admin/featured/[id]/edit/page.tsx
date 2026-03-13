import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getFeaturedReleaseById } from "@/lib/services/featured-releases-admin";
import { FeaturedReleaseForm } from "../../featured-release-form";
import { updateFeaturedReleaseAction } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditFeaturedReleasePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.OWNER_USER_ID) {
    redirect("/app");
  }

  const release = await getFeaturedReleaseById(id);
  if (!release) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-8">
        Edit: {release.title}
      </h1>
      <FeaturedReleaseForm
        action={updateFeaturedReleaseAction}
        release={release}
      />
    </div>
  );
}
