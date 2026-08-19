import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { controlButtonClass } from "@/components/instrument/ControlBar";

type OAuthResult = { redirect_url?: string; redirect_to?: string; client?: { name?: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: OAuthResult | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: OAuthResult | null; error: { message: string } | null }>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/login", search: { next } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search as unknown as string).get("authorization_id") ?? "";
    const { data, error } = await oauth().getAuthorizationDetails(id);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-5 py-12">
      <h1 className="font-display text-2xl uppercase">Authorization failed</h1>
      <p className="mt-2 font-mono text-xs" style={{ color: "var(--destructive)" }}>
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: err } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-12">
      <h1 className="font-display text-3xl uppercase tracking-tight">
        Connect {clientName} to Instrumento
      </h1>
      <div className="panel mt-6 space-y-4 p-5">
        <p className="text-sm text-muted-foreground">
          This lets {clientName} use this app as you — it can call Instrumento&apos;s enabled tools while
          you are signed in.
        </p>
        <p className="label-mono">
          This does not bypass this app&apos;s permissions or backend policies.
        </p>
        {error && (
          <p role="alert" className="font-mono text-xs" style={{ color: "var(--destructive)" }}>
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="button" className={controlButtonClass} disabled={busy} onClick={() => decide(true)}>
            Approve
          </button>
          <button type="button" className={controlButtonClass} disabled={busy} onClick={() => decide(false)}>
            Cancel connection
          </button>
        </div>
      </div>
    </main>
  );
}
