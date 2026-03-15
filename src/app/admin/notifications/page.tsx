import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { NotificationsPanel } from "@/components/admin/NotificationsPanel";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { fetchAllUsers } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

interface NotificationLogRow {
  id: string;
  sent_by: string;
  recipient_email: string;
  recipient_user_id: string | null;
  subject: string;
  heading: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  category: string;
  created_at: string;
}

export default async function AdminNotificationsPage() {
  const supabase = createSupabaseServiceClient();

  const { data: logs } = await supabase
    .from("admin_notifications_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (logs ?? []) as NotificationLogRow[];

  // Get subscriber data + user info for compose form
  const { data: subscribers } = await supabase
    .from("subscriptions")
    .select("user_id, plan, status");

  const allUsers = await fetchAllUsers();
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const userOptions: { userId: string; email: string; plan: string; status: string }[] = [];
  for (const sub of subscribers ?? []) {
    const s = sub as { user_id: string; plan: string; status: string };
    const authUser = userMap.get(s.user_id);
    if (authUser?.email) {
      userOptions.push({
        userId: s.user_id,
        email: authUser.email,
        plan: s.plan,
        status: s.status,
      });
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h1 className="text-2xl font-bold text-text">Notifications</h1>
        <AdminRefreshBar />
      </div>
      <p className="text-sm text-muted mb-6">
        Send email notifications to users. All sent notifications are logged below.
      </p>

      <NotificationsPanel sentLog={rows} userOptions={userOptions} />
    </div>
  );
}
