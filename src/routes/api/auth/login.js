import { createFileRoute } from "@tanstack/react-router";
import { createSession, json, sessionCookie, verifyPassword } from "@/lib/auth.server";
import { db } from "@/lib/db.server";

export const Route = createFileRoute("/api/auth/login")({
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

        const sql = db();
        const rows = await sql`
          select id, name, email, password_hash from users where email = ${email} limit 1
        `;
        const record = rows[0];
        if (!record || !(await verifyPassword(password, record.password_hash))) {
          return json({ error: "Incorrect email or password." }, 401);
        }

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
