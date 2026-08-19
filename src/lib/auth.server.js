// Server-only authentication helpers: bcrypt hashing + HTTP-only cookie sessions.
import bcrypt from "bcryptjs";
import { db } from "./db.server";

export const SESSION_COOKIE = "instrumento_session";
const SESSION_DAYS = 30;

export function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extraHeaders },
  });
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(userId) {
  const raw = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await sha256(raw);
  const sql = db();
  await sql`
    insert into sessions (token_hash, user_id, expires_at)
    values (${tokenHash}, ${userId}, now() + interval '${SESSION_DAYS} days')
  `;
  return raw;
}

export async function destroySession(raw) {
  if (!raw) return;
  const sql = db();
  await sql`delete from sessions where token_hash = ${await sha256(raw)}`;
}

export function readSessionCookie(request) {
  const header = request.headers.get("cookie") || "";
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null;
}

export function sessionCookie(raw) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${encodeURIComponent(raw)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

export function clearedCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

// Auth middleware equivalent: resolves the current user from the session cookie.
export async function currentUser(request) {
  const raw = readSessionCookie(request);
  if (!raw) return null;
  const sql = db();
  const rows = await sql`
    select u.id, u.name, u.email, u.created_at
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${await sha256(raw)} and s.expires_at > now()
    limit 1
  `;
  return rows[0] || null;
}

export async function requireUser(request) {
  const user = await currentUser(request);
  if (!user) throw json({ error: "Not authenticated" }, 401);
  return user;
}

export function validateEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return null;
}
