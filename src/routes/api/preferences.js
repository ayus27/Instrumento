import { createFileRoute } from "@tanstack/react-router";
import { currentUser, json } from "@/lib/auth.server";
import { db } from "@/lib/db.server";

const THEMES = ["light", "dark", "system"];
const PRIMARIES = ["amber", "slate", "indigo", "sage", "rose"];
const ACCENTS = ["amber", "slate", "indigo", "sage", "rose"];

export const Route = createFileRoute("/api/preferences")({
  server: {
    handlers: {
      // Users can only read/write their own preferences: the row is keyed on the session user.
      GET: async ({ request }) => {
        const user = await currentUser(request);
        if (!user) return json({ error: "Not authenticated" }, 401);
        const sql = db();
        const rows = await sql`
          select theme, primary_color, accent_color from user_preferences where user_id = ${user.id} limit 1
        `;
        return json({ preferences: rows[0] || null });
      },
      PUT: async ({ request }) => {
        const user = await currentUser(request);
        if (!user) return json({ error: "Not authenticated" }, 401);

        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request body." }, 400);
        }

        const theme = THEMES.includes(body?.theme) ? body.theme : "dark";
        const primary = PRIMARIES.includes(body?.primary_color) ? body.primary_color : "amber";
        const accent = ACCENTS.includes(body?.accent_color) ? body.accent_color : "slate";

        const sql = db();
        await sql`
          insert into user_preferences (user_id, theme, primary_color, accent_color, updated_at)
          values (${user.id}, ${theme}, ${primary}, ${accent}, now())
          on conflict (user_id) do update
            set theme = excluded.theme,
                primary_color = excluded.primary_color,
                accent_color = excluded.accent_color,
                updated_at = now()
        `;
        return json({ preferences: { theme, primary_color: primary, accent_color: accent } });
      },
    },
  },
});
