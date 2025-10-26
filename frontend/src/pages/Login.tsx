import React from "react";
import { post } from "../utils/api";

const LoginPage: React.FC<{ onSuccess: (token: string) => void }> = ({ onSuccess }) => {
  const [email, setEmail] = React.useState("test@example.com");
  const [password, setPassword] = React.useState("password123");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const data = await post<{ token?: string; access_token?: string }>("/auth/login", { email, password });
      const tok = data.token ?? data.access_token;
      if (!tok) throw new Error("Resposta sem token");
      onSuccess(tok);
    } catch (err: any) {
      setError(err?.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Entrar</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="btn w-full" disabled={loading}>{loading ? "A entrar..." : "Entrar"}</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;



