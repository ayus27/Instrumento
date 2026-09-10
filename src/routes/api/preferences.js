import { createFileRoute } from "@tanstack/react-router";
import { currentUser, json } from "@/lib/auth.server";
import { supabaseServer } from "@/lib/supabase.server";

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

        const { data } = await supabaseServer()
          .from("user_preferences")
          .select("theme, primary_color, accent_color")
          .eq("user_id", user.id)
          .single();

        return json({ preferences: data || null });
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

        await supabaseServer()
          .from("user_preferences")
          .upsert(
            {
              user_id: user.id,
              theme,
              primary_color: primary,
              accent_color: accent,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        return json({ preferences: { theme, primary_color: primary, accent_color: accent } });
      },
    },
  },
});
