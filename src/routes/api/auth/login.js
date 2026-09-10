import { createFileRoute } from "@tanstack/react-router";
import { json, sessionCookie } from "@/lib/auth.server";
import { supabaseServer } from "@/lib/supabase.server";

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

        const { data, error } = await supabaseServer().auth.signInWithPassword({
          email,
          password
        });

        if (error || !data.session) {
          return json({ error: "Incorrect email or password." }, 401);
        }

        const record = data.user;
        const token = data.session.access_token;
        
        return json(
          { user: { id: record.id, name: record.user_metadata?.name || "", email: record.email } },
          200,
          { "set-cookie": sessionCookie(token) },
        );
      },
    },
  },
});
