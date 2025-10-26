import React from "react";
import { get, post, patch, del } from "../utils/api";

type Task = {
  id: string;
  title: string;
  status: "todo"|"doing"|"done";
  priority: "low"|"medium"|"high";
  dueAt?: string | null;
  description?: string | null;
  createdAt?: string;
};

const statusColors: Record<Task["status"], string> = {
  todo: "bg-gray-100 text-gray-700",
  doing: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};
const priorityColors: Record<Task["priority"], string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

const EmptyState = () => (
  <div className="card p-10 text-center">
    <p className="text-lg font-medium mb-2">Sem tarefas…</p>
    <p className="text-sm text-gray-500">Cria uma nova tarefa para começar.</p>
  </div>
);

const NewTaskDialog: React.FC<{ onCreated: (t: Task) => void }> = ({ onCreated }) => {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState<Task["priority"]>("medium");
  const [due, setDue] = React.useState<string>("");

  async function create() {
    if (!title.trim()) return;
    const body: any = { title, priority };
    if (due) body.dueAt = new Date(due).toISOString();
    const t = await post<Task>("/tasks", body);
    onCreated(t);
    setOpen(false); setTitle(""); setPriority("medium"); setDue("");
  }

  return (
    <>
      <button className="btn" onClick={()=>setOpen(true)}>+ Nova tarefa</button>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4" onClick={()=>setOpen(false)}>
          <div className="card w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Nova tarefa</h3>
            <div className="space-y-3">
              <input className="input" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} />
              <div className="flex gap-2">
                <select className="input" value={priority} onChange={e=>setPriority(e.target.value as any)}>
                  <option value="low">Prioridade: Baixa</option>
                  <option value="medium">Prioridade: Média</option>
                  <option value="high">Prioridade: Alta</option>
                </select>
                <input className="input" type="datetime-local" value={due} onChange={e=>setDue(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn-outline" onClick={()=>setOpen(false)}>Cancelar</button>
                <button className="btn" onClick={create}>Criar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TasksPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<Task[]>([]);
  const [status, setStatus] = React.useState<""|"todo"|"doing"|"done">("");
  const [priority, setPriority] = React.useState<""|"low"|"medium"|"high">("");
  const [overdue, setOverdue] = React.useState<""|"true"|"false">("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (overdue) params.set("overdue", overdue);
    const res = await get<{ data: Task[]; meta: any }>(`/tasks?${params.toString()}`);
    setData(res.data);
    setLoading(false);
  }
  React.useEffect(() => { load(); }, [status, priority, overdue]);

  async function toggleStatus(t: Task) {
    const next: Task["status"] = t.status === "todo" ? "doing" : t.status === "doing" ? "done" : "todo";
    await patch(`/tasks/${t.id}`, { status: next });
    setData(prev => prev.map(x => x.id === t.id ? { ...x, status: next } : x));
  }
  async function remove(id: string) {
    await del(`/tasks/${id}`);
    setData(prev => prev.filter(x => x.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Barra de filtros + Nova */}
      <div className="card p-4 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option value="">Estado: Todos</option>
            <option value="todo">Por fazer</option>
            <option value="doing">A fazer</option>
            <option value="done">Feitas</option>
          </select>
          <select className="input w-auto" value={priority} onChange={e=>setPriority(e.target.value as any)}>
            <option value="">Prioridade: Todas</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          <select className="input w-auto" value={overdue} onChange={e=>setOverdue(e.target.value as any)}>
            <option value="">Prazo: Todos</option>
            <option value="true">Atrasadas</option>
            <option value="false">A tempo</option>
          </select>
          <button className="btn-outline" onClick={()=>{ setStatus(""); setPriority(""); setOverdue(""); }}>
            Limpar
          </button>
        </div>
        <NewTaskDialog onCreated={(t)=>setData(prev=>[t, ...prev])} />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({length:4}).map((_,i)=>(
            <div key={i} className="card p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map(t => (
            <div key={t.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold">{t.title}</h3>
                <div className="flex gap-2">
                  <Badge className={statusColors[t.status]}>{t.status}</Badge>
                  <Badge className={priorityColors[t.priority]}>{t.priority}</Badge>
                </div>
              </div>
              {t.description && <p className="text-sm text-gray-600 dark:text-gray-300">{t.description}</p>}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {t.dueAt ? `Limite: ${new Date(t.dueAt).toLocaleString()}` : "Sem prazo"}
                </p>
                <div className="flex gap-2">
                  <button className="btn-outline" onClick={()=>toggleStatus(t)}>
                    {t.status === "done" ? "Reabrir" : "Avançar"}
                  </button>
                  <button className="btn-outline" onClick={()=>remove(t.id)}>Apagar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;




