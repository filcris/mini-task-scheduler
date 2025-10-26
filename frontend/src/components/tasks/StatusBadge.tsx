import Badge from "../ui/Badge";

export default function StatusBadge({ status }: { status: "TODO" | "INPROGRESS" | "DONE" }) {
  const map = {
    TODO: { text: "To-do", intent: "neutral" as const },
    INPROGRESS: { text: "Em progresso", intent: "brand" as const },
    DONE: { text: "Concluída", intent: "success" as const },
  };
  const cfg = map[status] ?? map.TODO;
  return <Badge intent={cfg.intent}>{cfg.text}</Badge>;
}
