// src/lib/api.ts

// Base da API: preferimos VITE_API_URL; se não houver, usamos window.__API_URL__ (opcional)
// e por fim origin + /api (para quando o backend está atrás do mesmo host).
const BASE_URL: string =
  (typeof window !== 'undefined' && (window as any).__API_URL__) ||
  (import.meta as any)?.env?.VITE_API_URL ||
  `${window.location.origin}/api`;

function url(path: string) {
  // garante que não duplicamos barras
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// -------- Health --------
export async function ping(): Promise<{ ok: boolean } | any> {
  const res = await fetch(url('/health'));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// -------- Auth --------
export async function login(
  email: string,
  password: string
): Promise<{ access_token: string }> {
  const res = await fetch(url('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    // devolve mensagem do backend se existir, senão um erro genérico
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json(); // { access_token }
}

// (Opcional) Registo, caso o teu frontend tenha a página
export async function register(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ id: string; email: string; name: string | null }> {
  const res = await fetch(url('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// -------- Tasks --------
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'INPROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listTasks(
  token: string,
  page = 1,
  pageSize = 10,
  q?: string
): Promise<Paginated<Task>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) params.set('q', q);

  const res = await fetch(url(`/tasks?${params.toString()}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createTask(
  token: string,
  data: { title: string; description?: string; priority?: TaskPriority }
): Promise<Task> {
  const res = await fetch(url('/tasks'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateTask(
  token: string,
  id: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'status'>>
): Promise<Task> {
  const res = await fetch(url(`/tasks/${id}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteTask(token: string, id: string): Promise<{ ok: true }> {
  const res = await fetch(url(`/tasks/${id}`), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}






