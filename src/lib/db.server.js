// Neon PostgreSQL access. Server-only: DATABASE_URL never reaches the browser.
import { neon } from "@neondatabase/serverless";

let cached;

export function db() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not configured on the server.");
  if (!cached) cached = neon(url);
  return cached;
}
