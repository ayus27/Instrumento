import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-client";

export function AccountMenu() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return <span className="label-mono">…</span>;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/login" className="label-mono transition-colors hover:text-foreground">
          Log in
        </Link>
        <Link
          to="/signup"
          className="label-mono border border-panel-edge px-2 py-1 transition-colors hover:text-foreground"
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
