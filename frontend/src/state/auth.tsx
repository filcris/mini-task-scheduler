import React from 'react';
import * as api from '../lib/api';

type User = { id: string; email: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Recarrega token do localStorage
  React.useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) setToken(t);
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password); // deve devolver { access_token }
      const tk = res.access_token || (res as any).token;
      if (!tk) throw new Error('Token ausente');
      localStorage.setItem('token', tk);
      setToken(tk);
      // Opcional: poderias buscar /me para obter o utilizador real
      setUser({ id: 'me', email });
    } catch (e: any) {
      setError(e?.message || 'Login falhou');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = { user, token, loading, error, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
