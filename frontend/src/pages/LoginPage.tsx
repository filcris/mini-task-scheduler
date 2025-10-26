import React from "react";
import { useAuth } from "../state/auth";
import Spinner from "../components/Spinner";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = React.useState("test@example.com");
  const [password, setPassword] = React.useState("password123");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <div className="grid place-items-center py-10">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Login</h2>
          <p className="text-sm text-[rgb(var(--muted))]">Entre com as suas credenciais de teste.</p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            name="email"
            placeholder="email"
            type="email"
            className="input"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            name="password"
            placeholder="password"
            type="password"
            className="input"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? <span className="flex items-center justify-center gap-2"><Spinner/> A entrar…</span> : "Entrar"}
        </button>

        <p className="text-center text-xs text-[rgb(var(--muted))]">
          Demo: <code>test@example.com</code> / <code>password123</code>
        </p>
      </form>
    </div>
  );
}


