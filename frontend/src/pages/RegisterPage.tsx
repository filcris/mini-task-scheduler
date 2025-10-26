import { useState } from "react";
import { register } from "../lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await register(email, password, name);
      setMsg(`Registado: ${res.email}. Agora faz login.`);
    } catch (e: any) {
      setMsg(e.message ?? "Falha no registo");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <h2>Registo</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="nome (opcional)" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="password" />
      <button type="submit">Registar</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}

