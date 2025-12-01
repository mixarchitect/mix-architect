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
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          {mode === "signin"
            ? "Sign in to Mix Architect"
            : "Create a Mix Architect account"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-neutral-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-neutral-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm outline-none focus:border-neutral-400"
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
            className="w-full rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-900 disabled:opacity-60"
          >
            {loading
              ? "Working..."
              : mode === "signin"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400">
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

