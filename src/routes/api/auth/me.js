import { createFileRoute } from "@tanstack/react-router";
import { currentUser, json } from "@/lib/auth.server";
import { db } from "@/lib/db.server";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await currentUser(request);
        if (!user) return json({ user: null }, 200);

        const sql = db();
        const rows = await sql`
          select theme, primary_color, accent_color from user_preferences where user_id = ${user.id} limit 1
        `;
        return json({ user, preferences: rows[0] || null });
      },
    },
  },
});
