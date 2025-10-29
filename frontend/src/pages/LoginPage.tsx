import React, { useState } from 'react'
import { login as apiLogin, me as apiMe } from '../utils/api'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiLogin(email, password)
      try { await apiMe() } catch {}
      navigate('/tasks', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold mb-4">Entrar</h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}





