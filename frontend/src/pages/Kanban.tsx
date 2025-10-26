import React from "react";
import { get, patch } from "../utils/api";

type Task = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  dueAt?: string | null;
  description?: string | null;
};

type ColKey = "todo" | "doing" | "done";
const COLS: { key: ColKey; title: string }[] = [
  { key: "todo",  title: "Por fazer" },
  { key: "doing", title: "A fazer"   },
  { key: "done",  title: "Feitas"    },
];

const priorityDot: Record<Task["priority"], string> = {
  low: "bg-gray-300",
  medium: "bg-amber-400",
  high: "bg-rose-500",
};

export default function KanbanPage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<Record<ColKey, Task[]>>({ todo: [], doing: [], done: [] });
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = React.useState<ColKey | null>(null);

  async function load() {
    setLoading(true);
    const res = await get<{ data: Task[]; meta: any }>(`/tasks?limit=200`);
    const buckets: Record<ColKey, Task[]> = { todo: [], doing: [], done: [] };
    res.data.forEach(t => buckets[t.status].push(t));
    setData(buckets);
    setLoading(false);
  }
  React.useEffect(() => { load(); }, []);

  function onDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDragId(taskId);
  }

  function onDragOver(e: React.DragEvent, col: ColKey) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(col);
  }

  async function onDrop(e: React.DragEvent, col: ColKey) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (!id) return;
    setDragOverCol(null);

    // encontra a task e atualiza UI otimisticamente
    let from: ColKey | null = null;
    let task: Task | undefined;
    (Object.keys(data) as ColKey[]).forEach(k => {
      const idx = data[k].findIndex(t => t.id === id);
      if (idx !== -1) { from = k; task = data[k][idx]; }
    });
    if (!task || from === col) return;

    setData(prev => {
      const next = { ...prev };
      next[from! ] = prev[from!].filter(t => t.id !== id);
      next[col] = [{ ...task!, status: col }, ...prev[col]];
      return next;
    });

    try {
      await patch(`/tasks/${id}`, { status: col });
    } catch {
      // rollback em caso de erro
      setData(prev => {
        const next = { ...prev };
        next[col] = prev[col].filter(t => t.id !== id);
        next[from!] = [{ ...task!, status: from! }, ...prev[from!]];
        return next;
      });
      alert("Falha ao mover tarefa.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kanban</h2>
        <button className="btn-outline" onClick={load}>Recarregar</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-[60vh] p-4 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLS.map(col => (
            <div
              key={col.key}
              className={`card p-3 min-h-[60vh] flex flex-col ${dragOverCol === col.key ? "ring-2 ring-brand/50" : ""}`}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDrop={(e) => onDrop(e, col.key)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{col.title}</h3>
                <span className="text-xs text-gray-500">{data[col.key].length}</span>
              </div>

              <div className="flex-1 space-y-2">
                {data[col.key].map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e)=>onDragStart(e, t.id)}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 p-3 hover:bg-white dark:hover:bg-gray-900 cursor-move transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{t.title}</p>
                      <span className={`inline-flex items-center gap-1 text-xs ${priorityDot[t.priority]} text-white rounded-full px-2 py-0.5`}>
                        ● {t.priority}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{t.description}</p>}
                    <p className="text-[11px] text-gray-500 mt-2">
                      {t.dueAt ? `Limite: ${new Date(t.dueAt).toLocaleString()}` : "Sem prazo"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-3 text-xs text-gray-500">
                Arrasta tarefas para aqui para mudar o estado.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
