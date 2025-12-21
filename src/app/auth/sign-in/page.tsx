"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

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
        });
        if (error) throw error;
      }

      router.push("/app");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 card p-6">
        <div className="space-y-2 text-center">
          <p className="text-xs text-subtle uppercase tracking-[0.2em]">
            Access
          </p>
          <h1 className="text-2xl font-semibold">
            {mode === "signin"
              ? "Sign in to Mix Architect"
              : "Create a Mix Architect account"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div className="space-y-2">
            <label className="label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-70"
          >
            {loading
              ? "Working..."
              : mode === "signin"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-subtle">
          {mode === "signin" ? (
            <>
              Need an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="underline underline-offset-2"
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
                className="underline underline-offset-2"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}

