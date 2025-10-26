import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryTasksDto) {
    const where: Prisma.TaskWhereInput = {
      ownerId: userId,
      status: query.status,
      priority: query.priority,
      title: query.search
        ? { contains: query.search, mode: 'insensitive' }
        : undefined,
      dueAt:
        query.dueFrom || query.dueTo
          ? {
              gte: query.dueFrom ? new Date(query.dueFrom) : undefined,
              lte: query.dueTo ? new Date(query.dueTo) : undefined,
            }
          : undefined,
    };

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: { page, pageSize, total },
    };
  }

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: { ...dto, ownerId: userId },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const res = await this.prisma.task.updateMany({
      where: { id, ownerId: userId },
      data: dto,
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








