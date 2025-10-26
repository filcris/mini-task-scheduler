import Badge from "../ui/Badge";
export default function PriorityBadge({ priority = "MEDIUM" }: { priority?: "LOW"|"MEDIUM"|"HIGH" }) {
  const map = {
    LOW: { text: "Low", intent: "neutral" as const },
    MEDIUM: { text: "Medium", intent: "warning" as const },
    HIGH: { text: "High", intent: "danger" as const },
  };
  const cfg = map[priority] ?? map.MEDIUM;
  return <Badge intent={cfg.intent}>{cfg.text}</Badge>;
}
