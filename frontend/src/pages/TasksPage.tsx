import React from 'react'
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  type QueryTasks,
  type CreateTaskDto,
} from '../utils/api'
import { emit } from '../utils/bus'
import { useToast } from '../ui/Toast'
import { toCsv, downloadCsv } from '../utils/csv'

type Task = {
  id: string
  title: string
  description?: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'doing' | 'done'
  dueAt?: string | null
  dueDate?: string | null
  createdAt?: string
}

const emptyForm: CreateTaskDto = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
}

export default function TasksPage() {
  const toast = useToast()
  const [loading, setLoading] = React.useState(true)
  const [items, setItems] = React.useState<Task[]>([])
  const [error, setError] = React.useState<string>('')

  // filtros
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<QueryTasks['status']>()
  const [priority, setPriority] = React.useState<QueryTasks['priority']>()
  const [overdue, setOverdue] = React.useState<QueryTasks['overdue']>('false')

  // form criação
  const [form, setForm] = React.useState<CreateTaskDto>({ ...emptyForm })
  const [submitting, setSubmitting] = React.useState(false)

  // edição
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editDraft, setEditDraft] = React.useState<Partial<CreateTaskDto>>({})

  async function load() {
    setLoading(true); setError('')
    try {
      const data = await listTasks({
        search: search || undefined,
        status,
        priority,
        overdue,
      })
      const mapped: Task[] = data.map((t: any) => ({
        ...t,
        dueDate: t.dueDate ?? t.dueAt ?? null,
      }))
      setItems(mapped)
    } catch (e: any) {
      setError(e?.message || 'Falha a carregar tasks')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])
  React.useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id) }, [search, status, priority, overdue])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { toast.info('Título é obrigatório'); return }
    setSubmitting(true)
    try {
      const created: any = await createTask({
        title: form.title.trim(),
        description: form.description || null,
        priority: form.priority || 'medium',
        status: form.status || 'todo',
        dueDate: form.dueDate || undefined,
      })
      const normalized: Task = {
        ...created,
        dueDate: created?.dueDate ?? created?.dueAt ?? null,
      }
      setItems(prev => [normalized, ...prev])
      setForm({ ...emptyForm })
      emit('tasks:changed', { type: 'create', id: normalized.id })
      toast.success('Tarefa criada ✅')
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao criar tarefa')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(t: Task) {
    setEditingId(t.id)
    setEditDraft({
      title: t.title,
      description: t.description ?? '',
      priority: t.priority,
      status: t.status,
      dueDate: (t.dueDate ?? t.dueAt ?? '') as string,
    })
  }

  async function saveEdit(id: string) {
    try {
      const patch: any = { ...editDraft }
      if (patch.dueDate === '') patch.dueDate = undefined
      await updateTask(id, patch)
      setItems(prev =>
        prev.map(it =>
          it.id === id ? {
            ...it,
            title: (patch.title ?? it.title) as string,
            description: (patch.description ?? it.description) as any,
            priority: (patch.priority ?? it.priority) as any,
            status: (patch.status ?? it.status) as any,
            dueDate: (patch.dueDate ?? it.dueDate) as any,
          } : it,
        ),
      )
      setEditingId(null)
      setEditDraft({})
      emit('tasks:changed', { type: 'update', id })
      toast.success('Alterações guardadas 💾')
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao guardar alterações')
    }
  }

  async function remove(id: string) {
    if (!confirm('Queres mesmo apagar esta tarefa?')) return
    const backup = items
    setItems(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTask(id)
      emit('tasks:changed', { type: 'delete', id })
      toast.success('Tarefa apagada 🗑️')
    } catch (e: any) {
      setItems(backup)
      toast.error(e?.message || 'Erro ao apagar')
    }
  }

  function exportCsv() {
    if (!items.length) { toast.info('Sem tarefas para exportar'); return }
    const rows = items.map(t => ({
      id: t.id,
      titulo: t.title,
      descricao: t.description ?? '',
      estado: t.status,
      prioridade: t.priority,
      prazo: t.dueDate ? new Date(t.dueDate).toISOString() : '',
      criadoEm: t.createdAt ? new Date(t.createdAt).toISOString() : '',
    }))
    const csv = toCsv(rows, ';')  // usa ; para pt-PT (excel-friendly)
    downloadCsv('tarefas.csv', csv)
    toast.success('CSV exportado 📄')
  }

  // contadores simples
  const total = items.length
  const cTodo = items.filter(i => i.status==='todo').length
  const cDoing = items.filter(i => i.status==='doing').length
  const cDone = items.filter(i => i.status==='done').length
  const cOverdue = items.filter(i => (i.dueDate ? new Date(i.dueDate) < new Date() : false) && i.status!=='done').length

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <header className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <div className="flex flex-wrap gap-2">
          <input
            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            placeholder="Pesquisar..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <select className="select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={status ?? ''} onChange={e=>setStatus((e.target.value||undefined) as any)}>
            <option value="">Estado</option>
            <option value="todo">Por fazer</option>
            <option value="doing">A fazer</option>
            <option value="done">Feitas</option>
          </select>
          <select className="select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={priority ?? ''} onChange={e=>setPriority((e.target.value||undefined) as any)}>
            <option value="">Prioridade</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          <select className="select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={overdue} onChange={e=>setOverdue(e.target.value as any)}>
            <option value="false">Vencidas? não</option>
            <option value="true">Vencidas: sim</option>
          </select>
          <button className="btn" onClick={load}>Recarregar</button>
          <button className="btn" onClick={exportCsv}>Exportar CSV</button>
        </div>
      </header>

      {/* KPIs rápidos */}
      <div className="grid md:grid-cols-5 gap-3">
        <Kpi title="Total" value={total} />
        <Kpi title="Por fazer" value={cTodo} />
        <Kpi title="A fazer" value={cDoing} />
        <Kpi title="Feitas" value={cDone} />
        <Kpi title="Vencidas" value={cOverdue} />
      </div>

      {/* Form criar */}
      <form onSubmit={submit} className="card p-4 space-y-3 dark:bg-slate-900">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="label dark:text-slate-200">Título *</label>
            <input className="input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} />
          </div>
          <div>
            <label className="label dark:text-slate-200">Prazo (ISO ou YYYY-MM-DD)</label>
            <input className="input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="2025-12-31" value={form.dueDate ?? ''} onChange={e=>setForm(f=>({...f, dueDate:e.target.value}))} />
          </div>
          <div>
            <label className="label dark:text-slate-200">Prioridade</label>
            <select className="select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.priority} onChange={e=>setForm(f=>({...f, priority: e.target.value as any}))}>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div>
            <label className="label dark:text-slate-200">Estado</label>
            <select className="select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.status} onChange={e=>setForm(f=>({...f, status: e.target.value as any}))}>
              <option value="todo">Por fazer</option>
              <option value="doing">A fazer</option>
              <option value="done">Feita</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="label dark:text-slate-200">Descrição</label>
            <textarea className="input min-h-[80px] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={form.description ?? ''} onChange={e=>setForm(f=>({...f, description:e.target.value}))} />
          </div>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={submitting} type="submit">
            {submitting ? 'A criar…' : 'Criar'}
          </button>
        </div>
      </form>

      {/* Lista */}
      <div className="card p-0 overflow-x-auto dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-left">
              <th className="p-3">Título</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Prioridade</th>
              <th className="p-3">Prazo</th>
              <th className="p-3 w-36">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4">A carregar…</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="p-4 text-red-600">{error}</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-slate-500">Sem tarefas. Cria a primeira acima ✨</td></tr>
            ) : (
              items.map(t => (
                <tr key={t.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="p-3">
                    {editingId === t.id ? (
                      <input className="input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={editDraft.title ?? ''} onChange={e=>setEditDraft(d=>({...d, title:e.target.value}))} />
                    ) : (
                      <div className="font-medium">{t.title}</div>
                    )}
                    <div className="text-xs text-slate-500">{t.description}</div>
                  </td>
                  <td className="p-3">
                    {editingId === t.id ? (
                      <select className="select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={editDraft.status as any} onChange={e=>setEditDraft(d=>({...d, status: e.target.value as any}))}>
                        <option value="todo">Por fazer</option>
                        <option value="doing">A fazer</option>
                        <option value="done">Feita</option>
                      </select>
                    ) : (
                      <Badge value={t.status} map={{todo:'bg-slate-300', doing:'bg-amber-400', done:'bg-emerald-500'}} />
                    )}
                  </td>
                  <td className="p-3">
                    {editingId === t.id ? (
                      <select className="select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" value={editDraft.priority as any} onChange={e=>setEditDraft(d=>({...d, priority: e.target.value as any}))}>
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    ) : (
                      <Badge value={t.priority} map={{low:'bg-slate-400', medium:'bg-blue-500', high:'bg-rose-500'}} />
                    )}
                  </td>
                  <td className="p-3">
                    {editingId === t.id ? (
                      <input className="input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder="2025-12-31" value={(editDraft.dueDate as any) ?? ''} onChange={e=>setEditDraft(d=>({...d, dueDate: e.target.value}))} />
                    ) : (
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-PT') : '—'}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingId === t.id ? (
                      <div className="flex gap-2">
                        <button className="btn-primary" onClick={()=>saveEdit(t.id)}>Guardar</button>
                        <button className="btn" onClick={()=>{ setEditingId(null); setEditDraft({}) }}>Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="btn" onClick={()=>startEdit(t)}>Editar</button>
                        <button className="btn danger" onClick={()=>remove(t.id)}>Apagar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="card p-4 dark:bg-slate-900">
      <div className="text-xs text-slate-500 dark:text-slate-300">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function Badge({ value, map }: { value: string; map: Record<string, string> }) {
  const cls = map[value] || 'bg-slate-400'
  return <span className={`inline-flex items-center text-white text-[11px] px-2 py-0.5 rounded-full ${cls}`}>{value}</span>
}










