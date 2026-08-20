import { useState } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";

const inputClass =
  "w-full border border-panel-edge bg-transparent px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

export function AuthForm({ title, subtitle, submitLabel, withName, busy, error, onSubmit, footer }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto w-full max-w-md px-5 py-12">
      <h1 className="font-display text-3xl uppercase tracking-tight">{title}</h1>
      <p className="label-mono mt-1">{subtitle}</p>

      <div className="panel mt-6 space-y-4 p-5">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ name, email, password });
          }}
        >
          {withName && (
            <label className="block space-y-1">
              <span className="label-mono">Name</span>
              <input
                className={inputClass}
                value={name}
                required
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label className="block space-y-1">
            <span className="label-mono">Email</span>
            <input
              className={inputClass}
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
              className={inputClass}
              type="password"
              value={password}
              required
              minLength={8}
              autoComplete={withName ? "new-password" : "current-password"}
              onChange={(e) => setPassword(e.target.value)}
            />
            {withName && <span className="label-mono">Minimum 8 characters</span>}
          </label>
          <button type="submit" className={`${controlButtonClass} w-full`} disabled={busy}>
            {busy ? "Working…" : submitLabel}
          </button>
        </form>
        {error && (
          <p role="alert" className="font-mono text-xs" style={{ color: "var(--destructive)" }}>
            {error}
          </p>
        )}
        {footer}
      </div>
    </div>
  );
}
