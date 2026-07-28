import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { AUTH } from "../data";
import { api } from "../lib/api";

/* ------------------------------------------------------------------ context
   The session itself lives server-side, in an httpOnly cookie set by the
   API (server/src/auth.js) — nothing auth-related is kept in localStorage
   any more. On mount we ask the API who we are; `signIn` / `signUp` /
   `signOut` just call the matching endpoint and let the cookie do its job. */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const data = await api.post("/auth/login", { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(async (form) => {
    const data = await api.post("/auth/signup", form);
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    api.post("/auth/logout").catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthed: !!user,
      ready,
      signIn,
      signUp,
      signOut,
      /* Surfaces for the form — labels so the page doesn't have to know
         which copy to use. */
      copy: AUTH,
    }),
    [user, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    /* Provider missing is a developer error, not a runtime one — surface
       it loudly so a missing wrapper doesn't get debugged as a hook bug. */
    throw new Error("useAuth() must be used inside <AuthProvider>.");
  }
  return ctx;
}
