"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import {
  checkSubmissionEligibility,
  submitForFeature,
  withdrawSubmission,
  getSubmissionForRelease,
} from "@/lib/services/feature-submissions";
import type { FeatureSubmission } from "@/types/feature-submission";

export async function checkEligibilityAction(
  releaseId: string,
): Promise<{ eligible: boolean; reason?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { eligible: false, reason: "Not authenticated." };

  return checkSubmissionEligibility(releaseId, user.id);
}

export async function getSubmissionAction(
  releaseId: string,
): Promise<FeatureSubmission | null> {
  return getSubmissionForRelease(releaseId);
}

export async function submitForFeatureAction(params: {
  releaseId: string;
  pitchNote?: string;
  permissionGranted: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  // Re-check eligibility server-side
  const eligibility = await checkSubmissionEligibility(params.releaseId, user.id);
  if (!eligibility.eligible) {
    return { success: false, error: eligibility.reason };
  }

  if (!params.permissionGranted) {
    return { success: false, error: "Permission must be granted." };
  }

  try {
    await submitForFeature({
      userId: user.id,
      releaseId: params.releaseId,
      pitchNote: params.pitchNote,
      permissionGranted: params.permissionGranted,
    });
    revalidatePath(`/app/releases/${params.releaseId}`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Submission failed.";
    // Unique constraint violation
    if (msg.includes("unique_release_submission") || msg.includes("duplicate")) {
      return { success: false, error: "This release has already been submitted." };
    }
    return { success: false, error: msg };
  }
}

export async function withdrawSubmissionAction(
  submissionId: string,
  releaseId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  try {
    await withdrawSubmission(submissionId, user.id);
    revalidatePath(`/app/releases/${releaseId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Withdrawal failed.",
    };
  }
}
