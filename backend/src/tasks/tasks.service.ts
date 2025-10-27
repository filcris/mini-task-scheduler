// src/tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/** Payload paginado esperado pelos testes */
type Paged<T> = {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
};

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /** Listagem com paginação + filtros */
  async findAll(
    userId: string,
    query: QueryTasksDto,
  ): Promise<
    Paged<{
      id: string;
      title: string;
      status: TaskStatus;
      priority: TaskPriority;
      dueAt: Date | null;
      description: string | null;
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 10);

    const where: Prisma.TaskWhereInput = {
      ownerId: userId,
      // pesquisa por título/descrição (case-insensitive)
      OR:
        query.search && query.search.trim().length > 0
          ? [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      // filtro por status/priority se enviados
      status: query.status as TaskStatus | undefined,
      priority: query.priority as TaskPriority | undefined,
      // intervalo de datas de vencimento
      dueAt:
        query.dueFrom || query.dueTo
          ? {
              gte: query.dueFrom ? new Date(query.dueFrom) : undefined,
              lte: query.dueTo ? new Date(query.dueTo) : undefined,
            }
          : undefined,
    };

    const [total, rows] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: rows,
      meta: { page, pageSize, total },
    };
  }

  /** Criação de tarefa (associa pelo ownerId via input unchecked) */
  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ownerId: userId,
        title: dto.title,
        description: dto.description ?? null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        priority: (dto.priority as TaskPriority) ?? TaskPriority.medium,
        status: (dto.status as TaskStatus) ?? TaskStatus.todo,
      },
    });
  }

  /** Devolve uma tarefa do utilizador — lança 404 se não existir */
  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, ownerId: userId },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  /** Atualização com verificação de owner */
  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const res = await this.prisma.task.updateMany({
      where: { id, ownerId: userId },
      data: {
        title: dto.title,
        description: dto.description ?? undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        priority: dto.priority as TaskPriority | undefined,
        status: dto.status as TaskStatus | undefined,
      },
    });

    if (res.count === 0) throw new NotFoundException('Task not found');
    // findUnique pode devolver null — mas aqui só acontece se a task for removida entre update e read.
    const updated = await this.prisma.task.findUnique({ where: { id } });
    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }

  /** Remoção com verificação de owner */
  async remove(userId: string, id: string) {
    const res = await this.prisma.task.deleteMany({ where: { id, ownerId: userId } });
    if (res.count === 0) throw new NotFoundException('Task not found');
    return { deleted: true };
  }
}















