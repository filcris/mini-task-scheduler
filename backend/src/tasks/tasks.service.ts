import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Task, TaskPriority, TaskStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

type Paged<T> = { data: T[]; meta: { page: number; pageSize: number; total: number; pages: number } };

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryTasksDto): Promise<Paged<Task>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));

    const whereParts: Prisma.TaskWhereInput[] = [
      { ownerId: userId },
      query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {},
      query.status ? { status: query.status } : {},
      query.priority ? { priority: query.priority } : {},
    ];

    if (query.dueFrom || query.dueTo) {
      const gte = query.dueFrom ? new Date(query.dueFrom) : undefined;
      const lte = query.dueTo ? new Date(query.dueTo) : undefined;
      whereParts.push({ dueAt: { gte, lte } });
    }

    if (query.overdue === 'true') {
      whereParts.push({ dueAt: { lte: new Date() }, status: { not: TaskStatus.done } });
    }

    const where: Prisma.TaskWhereInput = { AND: whereParts };

    const [total, data] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        orderBy: [{ createdAt: 'desc' } as Prisma.TaskOrderByWithRelationInput],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const pages = Math.max(1, Math.ceil(total / pageSize));
    return { data, meta: { page, pageSize, total, pages } };
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        ownerId: userId,
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? TaskStatus.todo,
        priority: dto.priority ?? TaskPriority.medium,
        dueAt: dto.dueAt ?? null,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const updated = await this.prisma.task.updateMany({
      where: { id, ownerId: userId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueAt: dto.dueAt ?? null,
      },
    });
    if (updated.count === 0) throw new NotFoundException('Task not found');
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.prisma.task.deleteMany({ where: { id, ownerId: userId } });
    if (res.count === 0) throw new NotFoundException('Task not found');
  }
}












