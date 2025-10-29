import React, { createContext, useContext, useMemo, useState } from 'react';

type AuthContextValue = {
  token: string | null;
  isAuthed: boolean;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });

  const setToken = (t: string | null) => {
    setTokenState(t);
    try {
      if (t) localStorage.setItem('token', t);
      else localStorage.removeItem('token');
    } catch {
      // ignore storage errors (Safari private mode, etc.)
    }
  };

  const logout = () => setToken(null);

  const value = useMemo<AuthContextValue>(
    () => ({ token, isAuthed: !!token, setToken, logout }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}

