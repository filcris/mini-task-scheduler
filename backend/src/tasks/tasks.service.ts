import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskDto, TaskPriority, TaskStatus } from './dto/create-task.dto'

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, _query: any) {
    // Podes adicionar filtros de query quando quiseres.
    return this.prisma.task.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(userId: string, dto: CreateTaskDto) {
    // Defaults e normalizações para **minúsculas** (como no schema)
    const priority: TaskPriority = (dto.priority ?? TaskPriority.medium)
    const status: TaskStatus = (dto.status ?? TaskStatus.todo)

    // Aceita dueDate OU dueAt no DTO; mapeia para dueAt (modelo)
    const dueAt =
      dto.dueAt
        ? new Date(dto.dueAt)
        : dto.dueDate
          ? new Date(dto.dueDate)
          : null

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        priority, // low|medium|high
        status,   // todo|doing|done
        dueAt,    // Date | null
        // 👇 LIGA A TAREFA AO UTILIZADOR AUTENTICADO (resolve o 500)
        owner: { connect: { id: userId } },
      },
    })
  }

  async update(userId: string, id: string, dto: Partial<CreateTaskDto>) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException('Task não existe')
    if (task.ownerId !== userId) throw new ForbiddenException()

    const data: any = {}
    if (dto.title !== undefined) data.title = dto.title
    if (dto.description !== undefined) data.description = dto.description

    if (dto.priority !== undefined) {
      // garante minúsculas
      const p = String(dto.priority).toLowerCase() as TaskPriority
      data.priority = p
    }
    if (dto.status !== undefined) {
      const s = String(dto.status).toLowerCase() as TaskStatus
      data.status = s
    }

    // aceita dueDate/dueAt e mapeia para dueAt
    if (dto.dueAt !== undefined) {
      data.dueAt = dto.dueAt ? new Date(dto.dueAt) : null
    } else if (dto.dueDate !== undefined) {
      data.dueAt = dto.dueDate ? new Date(dto.dueDate) : null
    }

    return this.prisma.task.update({ where: { id }, data })
  }

  async remove(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException('Task não existe')
    if (task.ownerId !== userId) throw new ForbiddenException()
    await this.prisma.task.delete({ where: { id } })
    return { ok: true }
  }
}


















