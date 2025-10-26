export const API_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

function getToken() {
  for (const k of ["token","access_token","jwt"]) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
function commonHeaders() {
  const h: Record<string,string> = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}
async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    ["token","access_token","jwt"].forEach(k=>localStorage.removeItem(k));
    document.cookie = "token=; Max-Age=0; path=/";
    if (location.pathname !== "/login") location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error((await res.text().catch(()=>'')) || `${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function get<T>(p: string)  { return handle<T>(await fetch(`${API_URL}${p}`, { credentials:"include", headers: commonHeaders() })); }
export async function post<T>(p: string, body: any) { return handle<T>(await fetch(`${API_URL}${p}`, { method:"POST", credentials:"include", headers: commonHeaders(), body: JSON.stringify(body) })); }
export async function patch<T=any>(p: string, body: any) { return handle<T>(await fetch(`${API_URL}${p}`, { method:"PATCH", credentials:"include", headers: commonHeaders(), body: JSON.stringify(body) })); }
export async function del<T=any>(p: string) { return handle<T>(await fetch(`${API_URL}${p}`, { method:"DELETE", credentials:"include", headers: commonHeaders() })); }
