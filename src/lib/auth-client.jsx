import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabaseClient } from "./supabase.client";

const AuthContext = createContext({
  user: null,
  loading: true,
  preferences: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children, onPreferences }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/preferences");
      const data = await res.json();
      setPreferences(data.preferences || null);
      if (data.preferences && onPreferences) onPreferences(data.preferences);
    } catch {
      setPreferences(null);
    }
  }, [onPreferences]);

  useEffect(() => {
    const initAuth = async () => {
      // Get session
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.name || "" });
        await loadPreferences();
        
        // Let server know by calling /api/auth/login if needed
        // but wait, we already set the cookie if we use the backend endpoints to login!
        // The problem is if Supabase sets session locally, server doesn't know.
        // But if we just call the API endpoints we wrote, the server WILL know and set the cookie, 
        // AND Supabase JS will know because it's the same!
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, [loadPreferences]);

  async function post(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* empty body */
    }
    if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    return data;
  }

  const signIn = useCallback(
    async (email, password) => {
      // By calling the API endpoint, we get the httpOnly cookie AND we return user
      // Also, we can tell supabaseClient to sync if needed, but the server handles the cookie
      const data = await post("/api/auth/login", { email, password });
      setUser(data.user);
      
      // Let's also sign in locally just so supabaseClient has the token
      await supabaseClient.auth.signInWithPassword({ email, password });
      
      await loadPreferences();
      return data.user;
    },
    [loadPreferences],
  );

  const signUp = useCallback(
    async (name, email, password) => {
      const data = await post("/api/auth/signup", { name, email, password });
      setUser(data.user);
      
      await supabaseClient.auth.signInWithPassword({ email, password });
      
      await loadPreferences();
      return data.user;
    },
    [loadPreferences],
  );

  const signOut = useCallback(async () => {
    await post("/api/auth/logout", {});
    await supabaseClient.auth.signOut();
    setUser(null);
    setPreferences(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, preferences, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
