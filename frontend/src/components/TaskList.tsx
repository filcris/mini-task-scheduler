type Item = { id: string; title: string; status: "TODO"|"INPROGRESS"|"DONE" };

function StatusBadge({ status }: { status: Item["status"] }) {
  const map = {
    TODO: "bg-yellow-500/10 text-yellow-700 ring-yellow-500/20",
    INPROGRESS: "bg-blue-500/10 text-blue-700 ring-blue-500/20",
    DONE: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  } as const;
  return <span className={`badge ${map[status]}`}>{status}</span>;
}

export default function TaskList({ items }: { items: Item[] }) {
  if (!items?.length) {
    return <p className="text-sm text-[rgb(var(--muted))]">Sem tarefas</p>;
  }

  return (
    <ul className="grid gap-3">
      {items.map(t => (
        <li key={t.id} className="card flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate font-medium">{t.title}</p>
            <p className="text-xs text-[rgb(var(--muted))]">#{t.id}</p>
          </div>
          <StatusBadge status={t.status} />
        </li>
      ))}
    </ul>
  );
}



