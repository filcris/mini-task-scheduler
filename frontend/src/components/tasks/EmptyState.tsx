export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-10 text-center">
      <div className="mb-3 text-4xl">✨</div>
      <h3 className="text-base font-semibold text-zinc-900">Sem tarefas</h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-600">
        Organiza o teu dia criando uma nova tarefa. Podes definir prioridade e prazo.
      </p>
    </div>
  );
}
