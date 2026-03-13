import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  // Onboarding uses a full-page centered layout without the Shell sidebar/topbar.
  // The parent AppLayout still wraps us with NextIntlClientProvider and auth guard.
  return <>{children}</>;
}
