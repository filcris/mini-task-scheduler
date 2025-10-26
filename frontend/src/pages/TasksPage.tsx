import React from "react";
import { listTasks, createTask, updateTask, deleteTask } from "../lib/api";
import Button from "../components/ui/Button";
import TaskCard, { UITask } from "../components/tasks/TaskCard";
import TaskFormModal from "../components/tasks/TaskFormModal";
import EmptyState from "../components/tasks/EmptyState";

export default function TasksPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<UITask[]>([]);
  const [open, setOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await listTasks({ page: 1, pageSize: 50 }); // ajusta se necessário
      setItems(res.items ?? res ?? []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { fetchData(); }, []);

  async function handleCreate(values: { title: string; description?: string; priority?: UITask["priority"]; dueDate?: string; }) {
    setCreating(true);
    try {
      await createTask({
        title: values.title,
        description: values.description,
        priority: values.priority ?? "MEDIUM",
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      });
      setOpen(false);
      await fetchData();
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(id: string, next: UITask["status"]) {
    await updateTask(id, { status: next });
    await fetchData();
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setItems(curr => curr.filter(t => t.id !== id));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Tarefas</h1>
          <p className="mt-1 text-sm text-zinc-600">Prioriza, conclui, respira.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={fetchData}>Atualizar</Button>
          <Button onClick={() => setOpen(true)}>Nova tarefa</Button>
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TaskFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
        isLoading={creating}
      />
    </div>
  );
}



