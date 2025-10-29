import React from 'react'

type Toast = { id: string; type: 'success'|'error'|'info'; message: string; ttl?: number }
type Ctx = {
  show: (msg: string, type?: Toast['type'], ttlMs?: number) => void
  success: (msg: string, ttlMs?: number) => void
  error: (msg: string, ttlMs?: number) => void
  info: (msg: string, ttlMs?: number) => void
}
const ToastCtx = React.createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = React.useState<Toast[]>([])

  const remove = (id: string) => setList(prev => prev.filter(t => t.id !== id))

  const show = (message: string, type: Toast['type']='info', ttlMs=3000) => {
    const t: Toast = { id: Math.random().toString(36).slice(2), type, message, ttl: Date.now()+ttlMs }
    setList(prev => [...prev, t])
    setTimeout(() => remove(t.id), ttlMs)
  }
  const ctx: Ctx = {
    show,
    success: (m, ttl) => show(m, 'success', ttl),
    error: (m, ttl) => show(m, 'error', ttl),
    info: (m, ttl) => show(m, 'info', ttl),
  }

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div className="fixed z-[9999] bottom-4 right-4 flex flex-col gap-2">
        {list.map(t => (
          <div key={t.id}
               className={`rounded-lg px-3 py-2 text-sm text-white shadow-lg min-w-[220px] max-w-[360px] ${
                 t.type==='success' ? 'bg-emerald-600' :
                 t.type==='error'   ? 'bg-rose-600'    : 'bg-slate-800'
               }`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
