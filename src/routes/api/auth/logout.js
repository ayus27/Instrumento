import { createFileRoute } from "@tanstack/react-router";
import { clearedCookie, destroySession, json, readSessionCookie } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await destroySession(readSessionCookie(request));
        return json({ ok: true }, 200, { "set-cookie": clearedCookie() });
      },
    },
  },
});
