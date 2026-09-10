import { createFileRoute } from "@tanstack/react-router";
import { currentUser, json } from "@/lib/auth.server";
import { supabaseServer } from "@/lib/supabase.server";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await currentUser(request);
        if (!user) return json({ user: null }, 200);

        const { data } = await supabaseServer()
          .from("user_preferences")
          .select("theme, primary_color, accent_color")
          .eq("user_id", user.id)
          .single();

        return json({ user, preferences: data || null });
      },
    },
  },
});
