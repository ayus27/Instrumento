// Server-only authentication helpers using Supabase.
import { supabaseServer } from "./supabase.server";

export const SESSION_COOKIE = "instrumento_session";
const SESSION_DAYS = 30;

export function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extraHeaders },
  });
}

export function readSessionCookie(request) {
  const header = request.headers.get("cookie") || "";
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null;
}

export function sessionCookie(token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

export function clearedCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export async function currentUser(request) {
  const token = readSessionCookie(request);
  if (!token) return null;
  
  const { data: { user }, error } = await supabaseServer().auth.getUser(token);
  if (error || !user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || "",
    created_at: user.created_at
  };
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
