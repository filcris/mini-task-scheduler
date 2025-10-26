import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Devolve um resumo das tarefas do utilizador:
   * - contagem por estado (todo/doing/done)
   * - contagem de atrasadas (overdue: dueAt < now e não done)
   */
  async summary(userId: string) {
    const now = new Date();

    const [todo, doing, done, overdue] = await Promise.all([
      this.prisma.task.count({ where: { ownerId: userId, status: 'todo' } }),
      this.prisma.task.count({ where: { ownerId: userId, status: 'doing' } }),
      this.prisma.task.count({ where: { ownerId: userId, status: 'done' } }),
      this.prisma.task.count({
        where: {
          ownerId: userId,
          status: { in: ['todo', 'doing'] },
          dueAt: { lt: now },
        },
      }),
    ]);

    const total = todo + doing + done;

    return {
      total,
      todo,
      doing,
      done,
      overdue,
    };
  }
}

