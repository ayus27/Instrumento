// Shared password rules used by both the signup form and the signup API.
export const PASSWORD_RULES = [
  { id: "length", label: "At least 10 characters", test: (p) => p.length >= 10 },
  { id: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "A number", test: (p) => /\d/.test(p) },
  { id: "symbol", label: "A symbol (e.g. ! @ # $)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function checkPassword(password) {
  const p = typeof password === "string" ? password : "";
  return PASSWORD_RULES.map((r) => ({ id: r.id, label: r.label, ok: r.test(p) }));
}

export function passwordError(password) {
  if (typeof password !== "string") return "Password is required.";
  if (password.length > 128) return "Password must be 128 characters or fewer.";
  const failed = checkPassword(password).find((r) => !r.ok);
  return failed ? `Password needs: ${failed.label.toLowerCase()}.` : null;
}

// Simple lockout: 5 failed logins locks the email for 15 minutes.
export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

export function createLoginLimiter(now = () => Date.now()) {
  const state = new Map();
  return {
    isLocked(key) {
      const s = state.get(key);
      if (!s?.lockedUntil) return 0;
      const left = s.lockedUntil - now();
      if (left <= 0) { state.delete(key); return 0; }
      return left;
    },
    fail(key) {
      const s = state.get(key) ?? { count: 0, lockedUntil: 0 };
      s.count += 1;
      if (s.count >= MAX_FAILED_LOGINS) { s.lockedUntil = now() + LOCKOUT_MS; s.count = 0; }
      state.set(key, s);
    },
    succeed(key) { state.delete(key); },
  };
}
