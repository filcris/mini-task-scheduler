import React from 'react'
import { get, patch } from '../utils/api'
import { on } from '../utils/bus'
import { useToast } from '../ui/Toast'

type Task = {
  id: string
  title: string
  status: 'todo'|'doing'|'done'|'TODO'|'DOING'|'DONE'
  priority: 'low'|'medium'|'high'|'LOW'|'MEDIUM'|'HIGH'
  dueAt?: string | null
  dueDate?: string | null
  description?: string | null
  updatedAt?: string
}

type ColKey = 'todo' | 'doing' | 'done'
const COLS: { key: ColKey; title: string }[] = [
  { key: 'todo',  title: 'Por fazer' },
  { key: 'doing', title: 'A fazer'   },
  { key: 'done',  title: 'Concluídas'}
]
const toUiStatus = (s: Task['status']) => String(s).toLowerCase() as ColKey
const toUiPriority = (p: Task['priority']) => String(p).toLowerCase() as 'low'|'medium'|'high'

export default function KanbanPage() {
  const toast = useToast()
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Record<ColKey, Task[]>>({ todo: [], doing: [], done: [] })
  const [error, setError] = React.useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const res = await get<any>('/tasks?limit=200')
      const list: Task[] = Array.isArray(res) ? res : (res?.data || res?.items || res?.tasks || [])
      const buckets: Record<ColKey, Task[]> = { todo: [], doing: [], done: [] }
      list.forEach(t => { buckets[toUiStatus(t.status)].push(t) })
      setData(buckets)
    } catch (e: any) {
      const msg = e?.message || 'Falha a carregar tarefas'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
    const off = on('tasks:changed', () => load())
    return () => off()
  }, [])

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  async function onDrop(e: React.DragEvent, col: ColKey) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return

    let moved: Task | undefined
    setData(prev => {
      const next: Record<ColKey, Task[]> = { todo:[...prev.todo], doing:[...prev.doing], done:[...prev.done] }
      (Object.keys(next) as ColKey[]).forEach(k => {
        const i = next[k].findIndex(t => t.id === id)
        if (i !== -1) { moved = next[k][i]; next[k].splice(i,1) }
      })
      if (moved) next[col].unshift({ ...moved!, status: col as any })
      return next
    })

    try {
      await patch(`/tasks/${id}`, { status: col })
      toast.success('Movida no kanban ✔️')
    } catch {
      toast.error('Não foi possível mover a tarefa')
      load()
    }
  }

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kanban</h2>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {Object.values(data).reduce((n,arr)=>n+arr.length,0)} tarefa(s)
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({length:3}).map((_,i)=><div key={i} className="card h-[60vh] p-4 animate-pulse dark:bg-slate-900" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {COLS.map(col => (
            <div
              key={col.key}
              className="card p-3 min-h-[60vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              onDragOver={onDragOver}
              onDrop={(e)=>onDrop(e, col.key)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{col.title}</h3>
                <span className="text-xs text-slate-500">{data[col.key].length}</span>
              </div>

              <div className="space-y-2">
                {data[col.key].map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e)=>onDragStart(e, t.id)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 cursor-move hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{t.title}</p>
                      <span className={`text-xs px-2 rounded-full text-white ${
                        toUiPriority(t.priority) === 'high' ? 'bg-rose-500' :
                        toUiPriority(t.priority) === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                      }`}>
                        {toUiPriority(t.priority)}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{t.description}</p>}
                    <p className="text-[11px] text-slate-500 mt-2">
                      {(t.dueDate ?? t.dueAt) ? `Entrega: ${new Date((t.dueDate ?? t.dueAt)!).toLocaleDateString('pt-PT')}` : 'Sem prazo'}
                    </p>
                  </div>
                ))}
                {data[col.key].length === 0 && (
                  <div className="text-xs text-slate-500">Sem tarefas nesta coluna.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}




