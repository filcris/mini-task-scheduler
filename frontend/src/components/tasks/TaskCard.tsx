import React from "react";
import { Card, CardBody, CardFooter, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export type UITask = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "INPROGRESS" | "DONE";
  priority?: "LOW"|"MEDIUM"|"HIGH";
  dueDate?: string | null;
};

type Props = {
  task: UITask;
  onEdit?: (t: UITask) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, next: UITask["status"]) => void;
};

export default function TaskCard({ task, onEdit, onDelete, onToggle }: Props) {
  const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
  return (
    <Card className="transition hover:shadow-md">
      <CardHeader className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-zinc-900">{task.title}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority ?? "MEDIUM"} />
            {task.dueDate && (
              <span className="text-xs text-zinc-500">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </CardHeader>
      {task.description && (
        <CardBody>
          <p className="text-sm text-zinc-700 leading-6">{task.description}</p>
        </CardBody>
      )}
      <CardFooter className="flex items-center justify-end gap-2">
        {onEdit && <Button variant="ghost" onClick={() => onEdit(task)}>Editar</Button>}
        {onToggle && (
          <Button variant="secondary" onClick={() => onToggle(task.id, nextStatus)}>
            {task.status === "DONE" ? "Reabrir" : "Concluir"}
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" onClick={() => onDelete(task.id)}>Eliminar</Button>
        )}
      </CardFooter>
    </Card>
  );
}
