import React from 'react'
import { get } from '../utils/api'

type Task = {
  id: string
  title: string
  status: 'todo'|'doing'|'done'
  priority: 'low'|'medium'|'high'
  dueAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export default function Dashboard() {
  const [items, setItems] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    (async () => {
      setLoading(true); setError('')
      try {
        const res = await get<any>('/tasks?limit=500')
        const list: Task[] = Array.isArray(res) ? res : (res?.data || res?.items || res?.tasks || [])
        setItems(list)
      } catch (e: any) {
        setError(e?.message || 'Erro a carregar dados')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const total = items.length
  const byStatus = countBy(items.map(i=>i.status))
  const byPriority = countBy(items.map(i=>i.priority))
  const overdue = items.filter(i => i.status!=='done' && i.dueAt && new Date(i.dueAt) < new Date()).length
  const donePct = total ? Math.round((items.filter(i=>i.status==='done').length/total)*100) : 0

  // janela de 7 dias
  const now = new Date()
  const from = new Date(now)
  from.setDate(now.getDate() - 7)

  const created7 = items.filter(i => i.createdAt && new Date(i.createdAt) >= from).length
  const completed7 = items.filter(i => i.status==='done' && i.updatedAt && new Date(i.updatedAt) >= from).length

  function printPdf() {
    window.print()
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 print:bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button className="btn" onClick={printPdf}>Exportar PDF</button>
      </div>

      {loading ? <div className="card p-4 dark:bg-slate-900">A carregar…</div> : error ? <div className="card p-4 text-red-600 dark:bg-slate-900">{error}</div> : (
        <>
          <div className="grid md:grid-cols-4 gap-3">
            <Kpi title="Total" value={total} />
            <Kpi title="Concluídas (%)" value={donePct + '%'} />
            <Kpi title="Vencidas" value={overdue} />
            <Kpi title="Criadas (7d)" value={created7} />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="card p-4 dark:bg-slate-900">
              <h2 className="font-semibold mb-3">Por estado</h2>
              <ul className="text-sm space-y-1">
                <li>Por fazer: <b>{byStatus['todo']||0}</b></li>
                <li>A fazer: <b>{byStatus['doing']||0}</b></li>
                <li>Concluídas: <b>{byStatus['done']||0}</b></li>
                <li className="mt-2 text-slate-600 dark:text-slate-300">Concluídas (7d): <b>{completed7}</b></li>
              </ul>
            </div>
            <div className="card p-4 dark:bg-slate-900">
              <h2 className="font-semibold mb-3">Por prioridade</h2>
              <ul className="text-sm space-y-1">
                <li>Alta: <b>{byPriority['high']||0}</b></li>
                <li>Média: <b>{byPriority['medium']||0}</b></li>
                <li>Baixa: <b>{byPriority['low']||0}</b></li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function countBy(list: string[]) {
  return list.reduce((acc: Record<string, number>, k) => { acc[k]=(acc[k]||0)+1; return acc }, {})
}
function Kpi({ title, value }: { title: string; value: number|string }) {
  return (
    <div className="card p-4 dark:bg-slate-900">
      <div className="text-xs text-slate-500 dark:text-slate-300">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

