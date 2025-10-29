// src/context/auth.tsx (resumo do essencial)
import { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../utils/api';

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  const value = useMemo<AuthContextType>(() => ({
    token,
    async login(email, password) {
      const res = await apiLogin(email, password); // { access_token }
      localStorage.setItem('token', res.access_token);
      setToken(res.access_token);
      navigate('/tasks', { replace: true });
    },
    logout() {
      localStorage.removeItem('token');
      setToken(null);
      navigate('/login', { replace: true });
    },
  }), [token, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
