// src/utils/api.ts

// Base da API: usa VITE_API_URL se existir; senão, fallback para http://localhost:4000/api
const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api';

// Helpers de token
const TOKEN_KEY = 'token';

export function setToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Função central de fetch (evita // duplos e /api/api)
async function fetchJson<T = any>(
  path: string,
  init: RequestInit = {},
  opts?: { withAuth?: boolean },
): Promise<T> {
  const url =
    path.startsWith('http')
      ? path
      : `${API_BASE}/${path.replace(/^\/+/, '')}`; // junta base + path sem barras duplicadas

  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  if (opts?.withAuth !== false) {
    const token = getToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    // tenta extrair mensagem de erro da API
    let detail = '';
    try {
      const data = await res.json();
      detail = data?.message ?? JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`);
  }

  // sem conteúdo
  if (res.status === 204) return undefined as unknown as T;

  return (await res.json()) as T;
}

/* -------------------- AUTH -------------------- */

type LoginResponse = { access_token: string };

export async function login(email: string, password: string): Promise<LoginResponse> {
  const out = await fetchJson<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, { withAuth: false });

  setToken(out.access_token);
  return out;
}

export async function register(email: string, password: string, name: string | null) {
  return fetchJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  }, { withAuth: false });
}

export async function me() {
  return fetchJson('/auth/me', { method: 'GET' });
}

export function logout() {
  clearToken();
}

/* -------------------- HEALTH -------------------- */

export async function health() {
  return fetchJson('/health', { method: 'GET' }, { withAuth: false });
}

/* -------------------- TASKS -------------------- */

export type QueryTasks = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'todo' | 'doing' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueFrom?: string;
  dueTo?: string;
  overdue?: 'true' | 'false';
};

export async function listTasks(q: QueryTasks = {}) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return fetchJson(`/tasks${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export type CreateTaskDto = {
  title: string;
  description?: string | null;
  dueDate?: string | null;   // ISO
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'doing' | 'done';
};

export async function createTask(dto: CreateTaskDto) {
  return fetchJson('/tasks', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export async function updateTask(id: string, dto: UpdateTaskDto) {
  return fetchJson(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export async function deleteTask(id: string) {
  return fetchJson(`/tasks/${id}`, { method: 'DELETE' });
}


