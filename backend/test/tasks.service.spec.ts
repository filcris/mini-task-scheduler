import { TasksService } from '../src/tasks/tasks.service'

const prisma = {
  task: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
} as any

describe('TasksService', () => {
  let service: TasksService

  beforeEach(() => {
    jest.resetAllMocks()
    service = new TasksService(prisma as any)
  })

  it('list deve paginar e filtrar por ownerId', async () => {
    prisma.task.findMany.mockResolvedValue([
      { id: 't1', title: 'A', ownerId: 'u1' },
    ])

    const res = await service.list('u1', { page: 1, pageSize: 10 } as any)
    expect(prisma.task.findMany).toHaveBeenCalled()
    expect(Array.isArray(res)).toBe(true)
    expect(res[0].ownerId).toBe('u1')
  })

  it('create deve associar ownerId', async () => {
    prisma.task.create.mockResolvedValue({
      id: 't2',
      title: 'Nova',
      ownerId: 'u1',
      status: 'todo',
      priority: 'medium',
    })
    const res = await service.create('u1', { title: 'Nova' } as any)
    expect(prisma.task.create).toHaveBeenCalled()
    expect(res.ownerId).toBe('u1')
  })
})




