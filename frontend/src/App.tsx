import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import {
  login as apiLogin,
  me as apiMe,
  getToken,
  health as apiHealth,
} from './utils/api'
import TasksPage from './pages/TasksPage'
import KanbanPage from './pages/Kanban'
import Dashboard from './pages/Dashboard'
import { ToastProvider } from './ui/Toast'
import { ThemeProvider, useTheme } from './theme/ThemeProvider'

type User = { userId: string; email: string } | null

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = getToken()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [booting, setBooting] = useState(true)
  const [user, setUser] = useState<User>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await apiHealth().catch(() => null)
        const token = getToken()
        if (!token) return
        try {
          const u = await apiMe()
          if (alive) setUser(u as any)
        } catch { /* best-effort */ }
      } finally {
        if (alive) setBooting(false)
      }
    })()
    return () => { alive = false }
  }, [])

  if (booting) return <div style={{ padding: 24, fontFamily: 'system-ui' }}>A carregar…</div>

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Nav userEmail={user?.email || ''} />
          <main className="container-safe py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginScreen onSuccess={setUser} />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
              <Route path="/kanban" element={<PrivateRoute><KanbanPage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

function Nav({ userEmail }: { userEmail: string }) {
  const { theme, toggle } = useTheme()
  return (
    <nav className="h-12 border-b bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center gap-4 px-4 text-sm">
      {/* “Logo”/identidade */}
      <Link to="/" className="inline-flex items-center gap-2 mr-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white font-semibold">C</span>
        <span className="font-semibold text-slate-800 dark:text-slate-100">CED NSC</span>
      </Link>

      <Link to="/dashboard" className="text-slate-700 dark:text-slate-200">Dashboard</Link>
      <Link to="/tasks" className="text-slate-700 dark:text-slate-200">Tasks</Link>
      <Link to="/kanban" className="text-slate-700 dark:text-slate-200">Kanban</Link>
      <div className="ml-auto flex items-center gap-3">
        <button
          className="px-2 py-1 rounded border text-xs bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={toggle}
          title="Alternar tema"
        >
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <span className="text-slate-600 dark:text-slate-300">{userEmail}</span>
      </div>
    </nav>
  )
}

function Home() {
  return (
    <div className="text-slate-800 dark:text-slate-100">
      <h1 className="text-xl font-semibold">Mini Task Scheduler</h1>
      <p className="text-slate-600 dark:text-slate-300 mt-2">
        Vai ao <Link className="underline" to="/dashboard">Dashboard</Link>, às{' '}
        <Link className="underline" to="/tasks">Tasks</Link> ou ao{' '}
        <Link className="underline" to="/kanban">Kanban</Link>.
      </p>
    </div>
  )
}

function LoginScreen({ onSuccess }: { onSuccess: (u: any)=>void }) {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { access_token } = await apiLogin(email, password)
      if (access_token) {
        try {
          const u = await apiMe()
          onSuccess(u as any)
        } catch {
          onSuccess({ userId: 'local', email })
        }
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      setError(err?.message || 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="card w-full max-w-md p-6 dark:bg-slate-900">
        <h1 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Entrar</h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label dark:text-slate-200">Email</label>
            <input className="input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label dark:text-slate-200">Password</label>
            <input className="input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}













