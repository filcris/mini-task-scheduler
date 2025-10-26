import React, { useState } from 'react'
import { TasksAPI } from '../api'

export default function TaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW'|'MEDIUM'|'HIGH'>('MEDIUM')
  const [status, setStatus] = useState<'TODO'|'INPROGRESS'|'DONE'>('TODO')
  const [dueDate, setDueDate] = useState<string>('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await TasksAPI.create({
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    })
    setTitle(''); setDescription(''); setPriority('MEDIUM'); setStatus('TODO'); setDueDate('')
    onCreated()
  }

  return (
    <form onSubmit={submit} className="border rounded p-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)} />
        <label className="text-sm">
          Prioridade
          <select className="border rounded px-2 py-1 ml-2" value={priority} onChange={e=>setPriority(e.target.value as any)}>
            <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
          </select>
        </label>
        <label className="text-sm">
          Estado
          <select className="border rounded px-2 py-1 ml-2" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>TODO</option><option>INPROGRESS</option><option>DONE</option>
          </select>
        </label>
        <label className="text-sm">
          Data limite
          <input type="datetime-local" className="border rounded px-2 py-1 ml-2" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
        </label>
      </div>
      <div className="mt-3">
        <button className="px-3 py-2 rounded bg-black text-white">Criar tarefa</button>
      </div>
    </form>
  )
}
