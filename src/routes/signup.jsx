import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/lib/auth-client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Instrumento" },
      {
        name: "description",
        content: "Create an Instrumento account to save your appearance settings and recordings.",
      },
      { property: "og:title", content: "Sign Up — Instrumento" },
      { property: "og:description", content: "Create your Instrumento account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(values) {
    setBusy(true);
    setError(null);
    try {
      await signUp(values.name, values.email, values.password);
      navigate({ to: "/" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthForm
      title="Create account"
      subtitle="Instrumento account"
      submitLabel="Sign up"
      withName
      busy={busy}
      error={error}
      onSubmit={submit}
      footer={
        <Link to="/login" className="label-mono hover:text-foreground">
          Have an account? Log in
        </Link>
      }
    />
  );
}
