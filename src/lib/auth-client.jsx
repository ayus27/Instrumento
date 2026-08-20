import { createContext, useCallback, useContext, useEffect, useState } from "react";

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

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      const data = await res.json();
      setUser(data.user || null);
      setPreferences(data.preferences || null);
      if (data.user && data.preferences && onPreferences) onPreferences(data.preferences);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [onPreferences]);

  useEffect(() => {
    load();
  }, [load]);

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
      const data = await post("/api/auth/login", { email, password });
      setUser(data.user);
      await load();
      return data.user;
    },
    [load],
  );

  const signUp = useCallback(
    async (name, email, password) => {
      const data = await post("/api/auth/signup", { name, email, password });
      setUser(data.user);
      await load();
      return data.user;
    },
    [load],
  );

  const signOut = useCallback(async () => {
    await post("/api/auth/logout", {});
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
