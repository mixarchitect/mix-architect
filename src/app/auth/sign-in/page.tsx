"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { logActivityClient } from "@/lib/activity-logger-client";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Show error from OAuth callback failure
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_failed") {
      setErrorMsg("Sign in failed. Please try again.");
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    setErrorMsg(null);
    setGoogleLoading(true);
    logActivityClient("login", { method: "google" });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    // Clear error query param if present
    if (searchParams.get("error")) {
      router.replace("/auth/sign-in", { scroll: false });
    }

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

      // Full page load so session cookies are ready for server-side checks
      window.location.href = "/app";
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
                disabled={loading || googleLoading}
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

            {/* Google OAuth divider + button */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-panel px-4 text-faint">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full inline-flex items-center justify-center gap-3 h-11 px-5 rounded-[10px] text-sm font-semibold bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-400/40 border-t-zinc-600 rounded-full animate-spin" />
                  Redirecting...
                </span>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>

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
