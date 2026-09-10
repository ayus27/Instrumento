import { createFileRoute } from "@tanstack/react-router";
import { json, sessionCookie, validateEmail, validatePassword } from "@/lib/auth.server";
import { supabaseServer } from "@/lib/supabase.server";

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

        const { data, error } = await supabaseServer().auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });

        if (error || !data.session) {
            return json({ error: error?.message || "Could not create account." }, 400);
        }

        const user = data.user;
        const token = data.session.access_token;

        // Initialize user preferences in Supabase
        await supabaseServer().from("user_preferences").insert({ user_id: user.id });

        return json(
            { user: { id: user.id, name: user.user_metadata?.name || "", email: user.email } }, 
            201, 
            { "set-cookie": sessionCookie(token) }
        );
      },
    },
  },
});
