"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [mounted, setMounted] = useState(false);

  const supabase = createSupabaseBrowserClient();
  const { resolvedTheme } = useTheme();
  const t = useTranslations("auth");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: unknown } }) => {
      setHasSession(!!user);
      setSessionChecked(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg(t("passwordMinLength"));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t("passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/app";
      }, 2000);
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(t("resetPasswordFailed"));
      }
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
              {t("resetPasswordTitle")}
            </h1>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            {!sessionChecked ? (
              <div className="flex justify-center py-8">
                <span className="w-5 h-5 border-2 border-muted/40 border-t-muted rounded-full animate-spin" />
              </div>
            ) : !hasSession ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-sm text-muted">
                  {t("resetPasswordNoSession")}
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="inline-block text-sm text-text underline underline-offset-2 hover:text-signal transition-colors mt-2"
                >
                  {t("sendResetLink")}
                </Link>
              </div>
            ) : success ? (
              <div className="text-center space-y-3 py-4">
                <div className="text-3xl">&#10003;</div>
                <p className="text-sm text-muted">
                  {t("passwordUpdated")}
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="label text-muted">{t("newPassword")}</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="label text-muted">{t("confirmPassword")}</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="••••••••"
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
                        {t("updatingPassword")}
                      </span>
                    ) : (
                      t("updatePassword")
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
