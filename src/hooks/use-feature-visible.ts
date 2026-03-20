import { type FeatureKey } from "@/lib/features/feature-registry";
import { useFeatureVisibility } from "@/lib/features/feature-visibility-context";

export function useFeatureVisible(key: FeatureKey): boolean {
  const { isFeatureVisible } = useFeatureVisibility();
  return isFeatureVisible(key);
}
