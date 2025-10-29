// frontend/src/utils/api.ts

// ==================== BASE / ENV ====================
const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api'

// ==================== TOKEN HELPERS ====================
const TOKEN_KEY = 'token'

export function setToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ==================== FETCH CENTRAL ====================
async function fetchJson<T = any>(
  path: string,
  init: RequestInit = {},
  opts?: { withAuth?: boolean }
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE}/${path.replace(/^\/+/, '')}` // evita // e /api/api

  const headers = new Headers(init.headers || {})
  const method = (init.method || 'GET').toUpperCase()

  // content-type por defeito para não-GET
  if (!headers.has('Content-Type') && method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  // Authorization automático (a menos que withAuth === false)
  if (opts?.withAuth !== false) {
    const token = getToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const res = await fetch(url, { ...init, headers })

  if (!res.ok) {
    // tenta extrair uma mensagem útil
    let detail = ''
    try {
      const data = await res.json()
      detail = (data as any)?.message ?? JSON.stringify(data)
    } catch {
      try {
        detail = await res.text()
      } catch {/* noop */}
    }
    console.error('[API ERROR]', method, url, res.status, detail)
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`)
  }

  // sem conteúdo
  if (res.status === 204) return undefined as unknown as T

  // algumas APIs devolvem texto vazio em 201/200; protege o parse
  const text = await res.text()
  if (!text) return undefined as unknown as T
  try {
    return JSON.parse(text) as T
  } catch {
    // não era JSON; devolve texto cru
    return text as unknown as T
  }
}

// ==================== GENÉRICOS (p/ Kanban etc.) ====================
export const get = <T = any>(path: string) => fetchJson<T>(path, { method: 'GET' })
export const post = <T = any>(path: string, body?: any) =>
  fetchJson<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) })
export const patch = <T = any>(path: string, body?: any) =>
  fetchJson<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) })
export const del = <T = any>(path: string) => fetchJson<T>(path, { method: 'DELETE' })

// ==================== AUTH ====================
type LoginResponse = { access_token: string }

export async function login(email: string, password: string): Promise<LoginResponse> {
  const out = await fetchJson<LoginResponse>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
    { withAuth: false }
  )
  setToken(out.access_token)
  return out
}

export async function register(email: string, password: string, name?: string | null) {
  return fetchJson(
    '/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password, name: name ?? null }) },
    { withAuth: false }
  )
}

export async function me() {
  return fetchJson('/auth/me', { method: 'GET' })
}

export function logout() {
  clearToken()
}

// ==================== HEALTH ====================
export async function health() {
  return fetchJson('/health', { method: 'GET' }, { withAuth: false })
}

// ==================== TASKS ====================
export type QueryTasks = {
  page?: number
  pageSize?: number
  search?: string
  status?: 'todo' | 'doing' | 'done'
  priority?: 'low' | 'medium' | 'high'
  dueFrom?: string
  dueTo?: string
  overdue?: 'true' | 'false'
}

export type CreateTaskDto = {
  title: string
  description?: string | null
  dueDate?: string | null // ISO ou YYYY-MM-DD
  priority?: 'low' | 'medium' | 'high'
  status?: 'todo' | 'doing' | 'done'
}

export type UpdateTaskDto = Partial<CreateTaskDto>

// --- mapeamentos para enums do backend (maiúsculas) ---
const PRIORITY_OUT: Record<string, string> = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' }
const STATUS_OUT:   Record<string, string> = { todo: 'TODO', doing: 'DOING', done: 'DONE' }

// --- fallback minúsculas (se o backend usar lowercase) ---
const PRIORITY_OUT_LO: Record<string, string> = { low: 'low', medium: 'medium', high: 'high' }
const STATUS_OUT_LO:   Record<string, string> = { todo: 'todo', doing: 'doing', done: 'done' }

// --- parsing flexível de resposta ---
function tasksFromResponse(resp: any): any[] {
  if (Array.isArray(resp)) return resp
  if (resp?.items && Array.isArray(resp.items)) return resp.items
  if (resp?.data && Array.isArray(resp.data)) return resp.data
  if (resp?.results && Array.isArray(resp.results)) return resp.results
  if (resp?.tasks && Array.isArray(resp.tasks)) return resp.tasks
  return []
}

// --- normalização de datas ---
function normalizeDateISO(input?: string | null): string | null {
  if (!input) return null
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [dd, mm, yyyy] = input.split('/')
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`).toISOString()
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(`${input}T00:00:00.000Z`).toISOString()
  }
  const d = new Date(input)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

// --- listagem ---
export async function listTasks(q: QueryTasks = {}) {
  const params = new URLSearchParams()
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') params.set(k, String(v))
  })
  const qs = params.toString()
  const resp = await fetchJson(`/tasks${qs ? `?${qs}` : ''}`, { method: 'GET' })
  return tasksFromResponse(resp)
}

// --- criação (com tentativas automáticas p/ evitar 500) ---
export async function createTask(dto: CreateTaskDto) {
  const iso = normalizeDateISO(dto.dueDate)

  // Tentativas progressivas (da mais “provável” para a mais minimal)
  const tryPayloads: any[] = [
    // 1) enums MAIÚSCULAS + dueDate ISO
    {
      title: dto.title,
      description: dto.description ?? null,
      priority: PRIORITY_OUT[dto.priority ?? 'medium'],
      status: STATUS_OUT[dto.status ?? 'todo'],
      ...(iso ? { dueDate: iso } : {}),
    },
    // 2) enums MAIÚSCULAS + dueAt ISO
    {
      title: dto.title,
      description: dto.description ?? null,
      priority: PRIORITY_OUT[dto.priority ?? 'medium'],
      status: STATUS_OUT[dto.status ?? 'todo'],
      ...(iso ? { dueAt: iso } : {}),
    },
    // 3) enums minúsculas + dueDate ISO
    {
      title: dto.title,
      description: dto.description ?? null,
      priority: PRIORITY_OUT_LO[dto.priority ?? 'medium'],
      status: STATUS_OUT_LO[dto.status ?? 'todo'],
      ...(iso ? { dueDate: iso } : {}),
    },
    // 4) enums minúsculas + dueAt ISO
    {
      title: dto.title,
      description: dto.description ?? null,
      priority: PRIORITY_OUT_LO[dto.priority ?? 'medium'],
      status: STATUS_OUT_LO[dto.status ?? 'todo'],
      ...(iso ? { dueAt: iso } : {}),
    },
    // 5) só title (alguns backends definem defaults server-side)
    { title: dto.title },
  ]

  let lastErr: any
  for (const body of tryPayloads) {
    try {
      const created = await fetchJson('/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      // Se o backend não devolver o objeto, devolvemos algo útil (optimistic)
      return created ?? {
        id: 'tmp-' + Math.random().toString(36).slice(2),
        ...body,
      }
    } catch (e) {
      lastErr = e
      // tenta a próxima variante
    }
  }
  // Se todas falharem, lança o último erro (aparece no console)
  throw lastErr
}

// --- atualização (aceita enums/datas e ambos dueDate/dueAt) ---
export async function updateTask(id: string, dto: UpdateTaskDto) {
  const body: any = {}
  if (dto.title !== undefined) body.title = dto.title
  if (dto.description !== undefined) body.description = dto.description
  if (dto.priority !== undefined) {
    body.priority = PRIORITY_OUT[dto.priority] ?? dto.priority
  }
  if (dto.status !== undefined) {
    body.status = STATUS_OUT[dto.status] ?? dto.status
  }
  if (dto.dueDate !== undefined) {
    const iso = normalizeDateISO(dto.dueDate)
    if (iso) { body.dueDate = iso; body.dueAt = iso }
  }

  return fetchJson(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

// --- eliminação ---
export async function deleteTask(id: string) {
  return fetchJson(`/tasks/${id}`, { method: 'DELETE' })
}


