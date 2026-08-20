import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — Instrumento" },
      {
        name: "description",
        content: "Log in to Instrumento to sync your recordings and appearance settings.",
      },
      { property: "og:title", content: "Log In — Instrumento" },
      { property: "og:description", content: "Log in to your Instrumento account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(values) {
    setBusy(true);
    setError(null);
    try {
      await signIn(values.email, values.password);
      navigate({ to: "/" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthForm
      title="Log in"
      subtitle="Instrumento account"
      submitLabel="Log in"
      busy={busy}
      error={error}
      onSubmit={submit}
      footer={
        <Link to="/signup" className="label-mono hover:text-foreground">
          Need an account? Sign up
        </Link>
      }
    />
  );
}
