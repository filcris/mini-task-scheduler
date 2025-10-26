import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

type Values = {
  title: string;
  description?: string;
  priority?: "LOW"|"MEDIUM"|"HIGH";
  dueDate?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (v: Values) => void;
  initial?: Partial<Values>;
  isLoading?: boolean;
};

export default function TaskFormModal({ open, onClose, onSubmit, initial = {}, isLoading }: Props) {
  const [values, setValues] = React.useState<Values>({
    title: initial.title ?? "",
    description: initial.description ?? "",
    priority: initial.priority ?? "MEDIUM",
    dueDate: initial.dueDate ?? "",
  });

  React.useEffect(() => {
    setValues({
      title: initial.title ?? "",
      description: initial.description ?? "",
      priority: initial.priority ?? "MEDIUM",
      dueDate: initial.dueDate ?? "",
    });
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) return;
    onSubmit(values);
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova tarefa" footer={
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "A criar…" : "Criar"}
        </Button>
      </div>
    }>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-zinc-800">
          Título
          <input
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex.: Preparar apresentação"
            value={values.title}
            onChange={e => setValues(v => ({ ...v, title: e.target.value }))}
          />
        </label>
        <label className="text-sm font-medium text-zinc-800">
          Descrição
          <textarea
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Notas rápidas…"
            rows={3}
            value={values.description}
            onChange={e => setValues(v => ({ ...v, description: e.target.value }))}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-zinc-800">
            Prioridade
            <select
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={values.priority}
              onChange={e => setValues(v => ({ ...v, priority: e.target.value as any }))}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>
          <label className="text-sm font-medium text-zinc-800">
            Prazo
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={values.dueDate}
              onChange={e => setValues(v => ({ ...v, dueDate: e.target.value }))}
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}
