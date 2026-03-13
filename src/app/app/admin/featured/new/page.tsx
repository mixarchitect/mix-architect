import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { FeaturedReleaseForm } from "../featured-release-form";
import { createFeaturedReleaseAction } from "../actions";

export default async function NewFeaturedReleasePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.OWNER_USER_ID) {
    redirect("/app");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-8">
        New Featured Release
      </h1>
      <FeaturedReleaseForm action={createFeaturedReleaseAction} />
    </div>
  );
}
