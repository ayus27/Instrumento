import { createFileRoute } from "@tanstack/react-router";
import {
  createSession,
  hashPassword,
  json,
  sessionCookie,
  validateEmail,
  validatePassword,
} from "@/lib/auth.server";
import { db } from "@/lib/db.server";

export const Route = createFileRoute("/api/auth/signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request body." }, 400);
        }

        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = body?.password;

        if (!name) return json({ error: "Name is required." }, 400);
        if (!validateEmail(email)) return json({ error: "Enter a valid email address." }, 400);
        const pwError = validatePassword(password);
        if (pwError) return json({ error: pwError }, 400);

        const sql = db();
        const existing = await sql`select id from users where email = ${email} limit 1`;
        if (existing.length) return json({ error: "An account with that email already exists." }, 409);

        const passwordHash = await hashPassword(password);
        const rows = await sql`
          insert into users (name, email, password_hash)
          values (${name}, ${email}, ${passwordHash})
          returning id, name, email
        `;
        const user = rows[0];
        await sql`insert into user_preferences (user_id) values (${user.id}) on conflict do nothing`;

        const token = await createSession(user.id);
        return json({ user }, 201, { "set-cookie": sessionCookie(token) });
      },
    },
  },
});
