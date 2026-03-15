"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { logActivityClient } from "@/lib/activity-logger-client";

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() || undefined },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      }

      // Fire-and-forget activity log
      logActivityClient(mode === "signin" ? "login" : "signup", { method: "email" });

      if (mode === "signup") {
        setConfirmationSent(true);
        setLoading(false);
        return;
      }

      router.push("/app");
      // Don't reset loading — let the button stay disabled through navigation
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Something went wrong");
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Panel>
          <PanelHeader className="text-center">
            <img
              src={mounted && resolvedTheme === "dark" ? "/mix-architect-logo-white.svg" : "/mix-architect-logo.svg"}
              alt="Mix Architect"
              className="h-7 w-auto mx-auto mb-5"
            />
            <h1 className="mt-3 text-2xl font-semibold h1 text-text">
              {mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </h1>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            {confirmationSent ? (
              <div className="text-center space-y-3 py-4">
                <div className="text-3xl">✉️</div>
                <h2 className="text-lg font-semibold text-text">Check your email</h2>
                <p className="text-sm text-muted">
                  We sent a confirmation link to <strong className="text-text">{email}</strong>. Click the link to activate your account.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmationSent(false);
                    setMode("signin");
                  }}
                  className="text-sm text-text underline underline-offset-2 hover:text-signal transition-colors mt-2"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="label text-muted">Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="label text-muted">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label text-muted">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    {mode === "signin" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : mode === "signin" ? (
                  "Sign in"
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>

            <Rule className="my-5" />

            <p className="text-center text-sm text-muted">
              {mode === "signin" ? (
                <>
                  Need an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-text underline underline-offset-2 hover:text-signal transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-text underline underline-offset-2 hover:text-signal transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            <div className="mt-5 text-center">
              <Link
                href="/"
                className="text-xs text-faint hover:text-muted transition-colors"
              >
                ← Back to home
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
