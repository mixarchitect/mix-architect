"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  const supabase = createSupabaseBrowserClient();
  const { resolvedTheme } = useTheme();
  const t = useTranslations("auth");

  useEffect(() => setMounted(true), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (error) throw error;
      setLinkSent(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(t("somethingWrong"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center px-6 py-12 focus:outline-none">
      <div className="w-full max-w-md">
        <Panel>
          <PanelHeader className="text-center">
            <img
              src={mounted && resolvedTheme === "dark" ? "/mix-architect-logo-white.svg" : "/mix-architect-logo.svg"}
              alt="Mix Architect"
              className="h-7 w-auto mx-auto mb-5"
            />
            <h1 className="mt-3 text-2xl font-semibold h1 text-text">
              {t("forgotPasswordTitle")}
            </h1>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            {linkSent ? (
              <div className="text-center space-y-3 py-4">
                <div className="text-3xl">✉️</div>
                <h2 className="text-lg font-semibold text-text">{t("resetLinkSent")}</h2>
                <p className="text-sm text-muted">
                  {t.rich("resetLinkSentDescription", {
                    email,
                    b: (chunks) => <strong className="text-text">{chunks}</strong>,
                  })}
                </p>
                <Link
                  href="/auth/sign-in"
                  className="inline-block text-sm text-text underline underline-offset-2 hover:text-signal transition-colors mt-2"
                >
                  {t("backToSignIn")}
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted mb-5">
                  {t("forgotPasswordDescription")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="label text-muted">{t("email")}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      {errorMsg}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        {t("sendingResetLink")}
                      </span>
                    ) : (
                      t("sendResetLink")
                    )}
                  </Button>
                </form>

                <Rule className="my-5" />

                <div className="text-center">
                  <Link
                    href="/auth/sign-in"
                    className="text-xs text-faint hover:text-muted transition-colors"
                  >
                    &larr; {t("backToSignIn")}
                  </Link>
                </div>
              </>
            )}
          </PanelBody>
        </Panel>
      </div>
    </main>
  );
}
