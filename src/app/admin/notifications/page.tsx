import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { NotificationsPanel } from "@/components/admin/NotificationsPanel";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";

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

  // Get subscriber emails for the compose form autocomplete
  const { data: subscribers } = await supabase
    .from("subscriptions")
    .select("user_id, plan, status");

  const subUserIds = [...new Set((subscribers ?? []).map((s: { user_id: string }) => s.user_id))];
  const userOptions: { userId: string; email: string; plan: string; status: string }[] = [];

  if (subUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", subUserIds);

    if (profiles) {
      const emailMap: Record<string, string> = {};
      for (const p of profiles) {
        emailMap[p.id] = p.email ?? "";
      }

      for (const sub of subscribers ?? []) {
        const s = sub as { user_id: string; plan: string; status: string };
        if (emailMap[s.user_id]) {
          userOptions.push({
            userId: s.user_id,
            email: emailMap[s.user_id],
            plan: s.plan,
            status: s.status,
          });
        }
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
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
