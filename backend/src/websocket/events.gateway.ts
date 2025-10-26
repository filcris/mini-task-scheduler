import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(','),
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer() server!: Server;

  // eventos de tasks
  taskCreated(payload: any) {
    this.server.emit('task:created', payload);
  }
  taskUpdated(payload: any) {
    this.server.emit('task:updated', payload);
  }
  taskDeleted(payload: any) {
    this.server.emit('task:deleted', payload);
  }
}

