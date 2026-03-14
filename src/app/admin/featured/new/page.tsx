import { FeaturedReleaseForm } from "../featured-release-form";
import { createFeaturedReleaseAction } from "../actions";

export default function NewFeaturedReleasePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-8">
        New Featured Release
      </h1>
      <FeaturedReleaseForm action={createFeaturedReleaseAction} />
    </div>
  );
}
