import { redirect } from "next/navigation";

export default function RlsAuditRedirect() {
  redirect("/admin/security");
}
