import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, q: QueryTasksDto) {
    const where: Prisma.TaskWhereInput = {
      ownerId: userId,
      status: q.status,
      priority: q.priority,
      title: q.search
        ? { contains: q.search, mode: 'insensitive' }
        : undefined,
      dueAt:
        q.dueFrom || q.dueTo
          ? {
              gte: q.dueFrom ? new Date(q.dueFrom) : undefined,
              lte: q.dueTo ? new Date(q.dueTo) : undefined,
            }
          : undefined,
    };

    // Filtro overdue: dueAt < agora e status != 'done'
    if (q.overdue === 'true') {
      const now = new Date();

      // Normalizar where.AND para array
      const andParts: Prisma.TaskWhereInput[] = [];
      if (where.AND) {
        if (Array.isArray(where.AND)) andParts.push(...where.AND);
        else andParts.push(where.AND);
      }

      andParts.push({ dueAt: { lt: now } });
      andParts.push({ status: { not: 'done' as any } });

      where.AND = andParts;
    }

    // Compat: tests usam "limit"; clamp 1..50; fallback 10
    const limit =
      q.limit !== undefined
        ? Math.min(50, Math.max(1, q.limit))
        : undefined;

    // page/pageSize continuam suportados quando não há limit
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 10;
    const take = limit ?? pageSize;
    const skip = limit ? 0 : (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      total,      // alguns testes esperam aqui
      data,       // lista principal
      items: data, // alias p/ compatibilidade noutros testes
      meta: limit
        ? { limit, total }
        : { page, pageSize, total },
    };
  }

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ownerId: userId,
        title: dto.title,
        description: dto.description ?? null,
        status: (dto.status ?? 'todo') as any,
        priority: (dto.priority ?? 'medium') as any,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const res = await this.prisma.task.updateMany({
      where: { id, ownerId: userId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as any,
        priority: dto.priority as any,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
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











