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

  // Fetch team members for owner + quote count for fee label
  const [membersRes, quoteCountRes] = await Promise.all([
    role === "owner"
      ? supabase
          .from("release_members")
          .select("id, invited_email, role, accepted_at, user_id")
          .eq("release_id", releaseId)
          .order("created_at")
      : Promise.resolve({ data: null }),
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("release_id", releaseId)
      .eq("user_id", user.id)
      .neq("status", "cancelled"),
  ]);

  const members = (membersRes.data ?? []) as { id: string; invited_email: string; role: string; accepted_at: string | null; user_id: string | null }[];
  const hasQuotes = (quoteCountRes.count ?? 0) > 0;

  return (
    <SettingsForm
      releaseId={releaseId}
      role={role}
      initialMembers={members}
      hasQuotes={hasQuotes}
    />
  );
}
