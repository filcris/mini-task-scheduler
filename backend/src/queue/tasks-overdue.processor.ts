import { OnWorkerEvent,Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { PrismaService } from '../prisma/prisma.service';

@Processor('tasks')
export class TasksOverdueProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  // job.name = 'check-overdue'
  async process(job: Job<any, any, string>): Promise<void> {
    const now = new Date();
    const overdue = await this.prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: 'DONE' as any },
      },
      select: { id: true, title: true, ownerId: true, dueDate: true, status: true },
    });

    if (overdue.length) {
      // aqui poderias enviar email, push notification, ou socket.io
      console.log(`🔔 ${overdue.length} tarefa(s) em atraso:`, overdue.map(t => t.title));
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: any) {
    console.error('BullMQ job failed:', job?.name, err?.message || err);
  }
}
