import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-client";

export function AccountMenu() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return <span className="label-mono">…</span>;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm hover:underline underline-offset-4">
          Log in
        </Link>
        <Link
          to="/signup"
          className="pill bg-lime px-5 py-1.5 text-sm font-medium"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="label-mono" style={{ color: "var(--signal)" }}>
        {user.name}
      </span>
      <button
        type="button"
        className="label-mono transition-colors hover:text-foreground"
        onClick={async () => {
          await signOut();
          navigate({ to: "/" });
        }}
      >
        Log out
      </button>
    </div>
  );
}
