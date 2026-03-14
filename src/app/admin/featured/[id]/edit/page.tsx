import { notFound } from "next/navigation";
import { getFeaturedReleaseById } from "@/lib/services/featured-releases-admin";
import { FeaturedReleaseForm } from "../../featured-release-form";
import { updateFeaturedReleaseAction } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditFeaturedReleasePage({ params }: Props) {
  const { id } = await params;
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
