import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type TaskStatus = 'todo' | 'doing' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskEventPayload {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@WebSocketGateway({
  cors: {
    origin: [/^http:\/\/localhost:(5173|5174)$/],
    credentials: true,
  },
  namespace: '/', // usa o namespace root
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket): void {
    // podes usar isto para debug/logs
    client.emit('connected', { ok: true });
  }

  handleDisconnect(_client: Socket): void {
    // noop
  }

  /** Emite para todos os clientes quando uma task é criada */
  emitTaskCreated(payload: TaskEventPayload): void {
    this.server.emit('task:created', payload);
  }

  /** Emite para todos os clientes quando uma task é atualizada */
  emitTaskUpdated(payload: TaskEventPayload): void {
    this.server.emit('task:updated', payload);
  }

  /** Emite para todos os clientes quando uma task é removida */
  emitTaskDeleted(taskId: string): void {
    this.server.emit('task:deleted', { id: taskId });
  }
}


