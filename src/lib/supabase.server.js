import { createClient } from "@supabase/supabase-js";

let client;

export function supabaseServer() {
    if (client) return client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
        throw new Error("SUPABASE_URL is not configured.");
    }

    if (!key) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
    }

    client = createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });

    return client;
}