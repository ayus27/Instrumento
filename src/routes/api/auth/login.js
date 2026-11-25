import { createFileRoute } from "@tanstack/react-router";
import { createSession, json, sessionCookie, verifyPassword } from "@/lib/auth.server";
import { db } from "@/lib/db.server";
import { createLoginLimiter } from "@/lib/auth/passwordPolicy";

const limiter = createLoginLimiter();

export const Route = createFileRoute("/api/auth/login")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request body." }, 400);
        }

        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = body?.password;
        if (!email || typeof password !== "string" || !password) {
          return json({ error: "Email and password are required." }, 400);
        }

        const locked = limiter.isLocked(email);
        if (locked) {
          const mins = Math.ceil(locked / 60000);
          return json({ error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` }, 429);
        }

        const sql = db();
        const rows = await sql`
          select id, name, email, password_hash from users where email = ${email} limit 1
        `;
        const record = rows[0];
        if (!record || !(await verifyPassword(password, record.password_hash))) {
          limiter.fail(email);
          return json({ error: "Incorrect email or password." }, 401);
        }
        limiter.succeed(email);

        const token = await createSession(record.id);
        return json(
          { user: { id: record.id, name: record.name, email: record.email } },
          200,
          { "set-cookie": sessionCookie(token) },
        );
      },
    },
  },
});
