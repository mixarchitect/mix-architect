import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyEditFeaturedPage({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/featured/${id}/edit`);
}
