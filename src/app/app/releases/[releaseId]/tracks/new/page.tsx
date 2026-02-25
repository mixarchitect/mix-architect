import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getReleaseRole } from "@/lib/get-release-role";
import { canEdit } from "@/lib/permissions";
import { NewTrackForm } from "./new-track-form";

type Props = {
  params: Promise<{ releaseId: string }>;
};

export default async function NewTrackPage({ params }: Props) {
  const { releaseId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const role = await getReleaseRole(supabase, releaseId, user.id);
  if (!canEdit(role)) redirect(`/app/releases/${releaseId}`);

  return <NewTrackForm releaseId={releaseId} />;
}
