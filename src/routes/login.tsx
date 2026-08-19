import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { controlButtonClass } from "@/components/instrument/ControlBar";

function safeNext(value: unknown): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign In — Instrumento" },
      {
        name: "description",
        content: "Sign in to Instrumento to connect the app to AI assistants and other tools.",
      },
      { property: "og:title", content: "Sign In — Instrumento" },
      { property: "og:description", content: "Sign in to your Instrumento account." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s['next']) }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const returnUrl = `${typeof window === "undefined" ? "" : window.location.origin}${next}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMessage(error.message);
      window.location.href = next;
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: returnUrl },
      });
      setBusy(false);
      if (error) return setMessage(error.message);
      setMessage("Check your email to confirm your account, then sign in.");
      setMode("signin");
    }
  }

  async function google() {
    setBusy(true);
    setMessage(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: returnUrl });
    if (result.error) {
      setBusy(false);
      setMessage(result.error.message ?? "Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: next });
  }

  const input =
    "w-full border border-panel-edge bg-transparent px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

  return (
    <div className="mx-auto w-full max-w-md px-5 py-12">
      <h1 className="font-display text-3xl uppercase tracking-tight">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      <p className="label-mono mt-1">Instrumento account</p>

      <div className="panel mt-6 space-y-4 p-5">
        <button type="button" className={`${controlButtonClass} w-full`} disabled={busy} onClick={google}>
          Continue with Google
        </button>
        <div className="label-mono text-center">or</div>
        <form className="space-y-3" onSubmit={submit}>
          <label className="block space-y-1">
            <span className="label-mono">Email</span>
            <input
              className={input}
              type="email"
              value={email}
              required
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="label-mono">Password</span>
            <input
              className={input}
              type="password"
              value={password}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className={`${controlButtonClass} w-full`} disabled={busy}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        {message && (
          <p role="alert" className="font-mono text-xs" style={{ color: "var(--destructive)" }}>
            {message}
          </p>
        )}
        <button
          type="button"
          className="label-mono hover:text-foreground"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
