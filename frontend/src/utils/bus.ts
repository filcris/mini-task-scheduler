// micro event bus para sincronizar páginas (Kanban <-> Tasks)
type Handler = (...args: any[]) => void
const listeners = new Map<string, Set<Handler>>()

export function on(event: string, fn: Handler) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(fn)
  return () => off(event, fn)
}
export function off(event: string, fn: Handler) {
  listeners.get(event)?.delete(fn)
}
export function emit(event: string, ...args: any[]) {
  listeners.get(event)?.forEach(fn => fn(...args))
}
