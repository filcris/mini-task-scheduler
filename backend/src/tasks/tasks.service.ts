import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryTasksDto } from './dto/query-tasks.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, q: QueryTasksDto) {
    const page  = Math.max(1, q.page ?? 1);
    const take  = Math.min(50, Math.max(1, q.limit ?? 10));
    const skip  = (page - 1) * take;

    const where: any = { ownerId: userId };
    if (q.status)   where.status   = q.status;
    if (q.priority) where.priority = q.priority;
    if (q.overdue === 'true') {
      where.AND = [
        ...(where.AND ?? []),
        { status: { not: 'done' } },
        { dueAt:  { lt: new Date() } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where, skip, take,
        orderBy: [{ createdAt: 'desc' }],
      }),
    ]);

    return {
      data,
      meta: { page, limit: take, total, pages: Math.max(1, Math.ceil(total / take)) },
    };
  }

  async create(
    userId: string,
    payload: { title: string; priority?: 'low'|'medium'|'high'; dueAt?: Date; description?: string }
  ) {
    return this.prisma.task.create({
      data: {
        title: payload.title,
        priority: payload.priority ?? 'medium',
        dueAt: payload.dueAt ?? null,
        description: payload.description ?? null,
        ownerId: userId,
      },
    });
  }

  async update(userId: string, id: string, data: any) {
    // só atualiza se pertencer ao utilizador
    const res = await this.prisma.task.updateMany({
      where: { id, ownerId: userId },
      data,
    });
    if (res.count === 0) throw new NotFoundException('Task not found');

    return this.prisma.task.findUnique({ where: { id } });
  }

  async remove(userId: string, id: string) {
    const res = await this.prisma.task.deleteMany({
      where: { id, ownerId: userId },
    });
    if (res.count === 0) throw new NotFoundException('Task not found');
    return { ok: true };
  }
}







