import { redirect } from "next/navigation";

export default function LegacyNewFeaturedPage() {
  redirect("/admin/featured/new");
}
