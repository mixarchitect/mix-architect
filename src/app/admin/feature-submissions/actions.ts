"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import {
  updateSubmissionStatus,
} from "@/lib/services/feature-submissions-admin";

export async function approveSubmissionAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await updateSubmissionStatus(id, "approved");
  revalidatePath("/admin/feature-submissions");
}

export async function declineSubmissionAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const notes = (formData.get("admin_notes") as string) || undefined;
  await updateSubmissionStatus(id, "declined", notes);
  revalidatePath("/admin/feature-submissions");
}
