"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Button } from "@/components/ui/button";

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
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <Panel>
          <PanelHeader className="text-center space-y-2">
            <p className="label text-faint">ACCESS</p>
            <h1 className="text-2xl font-semibold">
              {mode === "signin" ? "Sign in to Mix Architect" : "Create a Mix Architect account"}
            </h1>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="label text-faint">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-panel"
                />
              </div>

              <div className="space-y-2">
                <label className="label text-faint">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-panel"
                />
              </div>

              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

              <Button type="submit" disabled={loading} variant="primary" className="w-full">
                {loading ? "Working..." : mode === "signin" ? "Sign in" : "Sign up"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted">
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
          </PanelBody>
        </Panel>
      </div>
    </main>
  );
}

