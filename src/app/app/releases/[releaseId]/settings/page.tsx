import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getReleaseRole } from "@/lib/get-release-role";
import { SettingsForm } from "./settings-form";

type Props = { params: Promise<{ releaseId: string }> };

export default async function ReleaseSettingsPage({ params }: Props) {
  const { releaseId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const role = await getReleaseRole(supabase, releaseId, user.id);
  if (!role) redirect(`/app/releases/${releaseId}`);

  // Fetch team members for owner
  let members: { id: string; invited_email: string; role: string; accepted_at: string | null; user_id: string | null }[] = [];
  if (role === "owner") {
    const { data } = await supabase
      .from("release_members")
      .select("id, invited_email, role, accepted_at, user_id")
      .eq("release_id", releaseId)
      .order("created_at");
    members = (data ?? []) as typeof members;
  }

  return (
    <SettingsForm
      releaseId={releaseId}
      role={role}
      initialMembers={members}
    />
  );
}
