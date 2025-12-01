import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export default async function AppDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-neutral-400">
        Welcome{user?.email ? `, ${user.email}` : ""}. This is where Releases
        and Tracks will live.
      </p>
    </div>
  );
}

