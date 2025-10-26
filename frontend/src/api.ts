// src/api.ts
// URL da API (browser → backend)
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')

// Tenta encontrar o token em várias chaves ou cookie
function getToken(): string | null {
  const keys = ['token', 'access_token', 'jwt']
  for (const k of keys) {
    const v = localStorage.getItem(k)
    if (v) return v
  }
  // tenta cookie "token"
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

// Se for 401, manda para /login
async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    // remove tokens “velhos”
    localStorage.removeItem('token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('jwt')
    // opcional: limpa cookie
    document.cookie = 'token=; Max-Age=0; path=/'
    // redireciona
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(txt || `${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: headers(),
  })
  return handle<T>(res)
}

export async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    credentials: 'include',
  })
  return handle<T>(res)
}

