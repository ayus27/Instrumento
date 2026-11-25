import { useState } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { checkPassword, passwordError } from "@/lib/auth/passwordPolicy";

// text-base (16px) stops iOS from zooming into inputs; min-h-12 = comfortable tap target.
const inputClass =
  "min-h-12 w-full rounded-full border-[1.5px] border-foreground bg-transparent px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function AuthForm({ title, subtitle, submitLabel, withName, busy, error, onSubmit, footer }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState(null);
  const rules = checkPassword(password);

  function submit(e) {
    e.preventDefault();
    setLocalError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (withName) {
      if (name.trim().length < 2) return setLocalError("Name must be at least 2 characters.");
      const pw = passwordError(password);
      if (pw) return setLocalError(pw);
      if (password !== confirm) return setLocalError("Passwords don't match.");
    }
    onSubmit({ name: name.trim(), email: cleanEmail, password });
  }

  const shown = localError || error;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
      <p className="label-mono mt-1">{subtitle}</p>

      <div className="panel mt-6 space-y-4 p-5 sm:p-6">
        <form className="space-y-4" onSubmit={submit} noValidate>
          {withName && (
            <label className="block space-y-1.5">
              <span className="label-mono">Name</span>
              <input className={inputClass} value={name} required maxLength={60}
                autoComplete="name" autoCapitalize="words" enterKeyHint="next"
                onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label className="block space-y-1.5">
            <span className="label-mono">Email</span>
            <input className={inputClass} type="email" inputMode="email" value={email} required
              maxLength={254} autoComplete="email" autoCapitalize="none" autoCorrect="off"
              spellCheck={false} enterKeyHint="next" onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="label-mono">Password</span>
            <div className="relative">
              <input className={`${inputClass} pr-20`} type={show ? "text" : "password"} value={password}
                required maxLength={128} autoComplete={withName ? "new-password" : "current-password"}
                autoCapitalize="none" autoCorrect="off" spellCheck={false}
                onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 min-h-9 -translate-y-1/2 rounded-full px-3 text-sm hover:bg-accent">
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {withName && (
            <>
              <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2" aria-label="Password requirements">
                {rules.map((r) => (
                  <li key={r.id} className={r.ok ? "text-foreground" : "text-muted-foreground"}>
                    <span aria-hidden>{r.ok ? "✓" : "○"}</span> {r.label}
                    <span className="sr-only">{r.ok ? " (met)" : " (not met)"}</span>
                  </li>
                ))}
              </ul>
              <label className="block space-y-1.5">
                <span className="label-mono">Confirm password</span>
                <input className={inputClass} type={show ? "text" : "password"} value={confirm}
                  required autoComplete="new-password" enterKeyHint="go"
                  onChange={(e) => setConfirm(e.target.value)} />
                {confirm && confirm !== password && (
                  <span className="text-sm text-muted-foreground">Passwords don't match yet</span>
                )}
              </label>
            </>
          )}
          <button type="submit" className={`${controlButtonClass} min-h-12 w-full`} disabled={busy}>
            {busy ? "Working…" : submitLabel}
          </button>
        </form>
        {shown && (
          <p role="alert" className="text-sm" style={{ color: "var(--destructive)" }}>{shown}</p>
        )}
        {footer}
      </div>
    </div>
  );
}
