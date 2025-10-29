import { Test } from '@nestjs/testing'
import { TasksController } from '../src/tasks/tasks.controller'
import { TasksService } from '../src/tasks/tasks.service'

describe('TasksController', () => {
  let controller: TasksController
  let service: jest.Mocked<TasksService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            list: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(TasksController)
    service = module.get(TasksService) as any
  })

  it('GET /tasks -> list', async () => {
    service.list.mockResolvedValue([{ id: 't1', title: 'A' } as any])
    // no Nest, costumamos ter req.user com { userId, email }
    const res = await controller.list({ user: { userId: 'u1' } } as any, { page: 1, pageSize: 10 } as any)
    expect(service.list).toHaveBeenCalledWith('u1', { page: 1, pageSize: 10 })
    expect(res).toEqual([{ id: 't1', title: 'A' }])
  })

  it('POST /tasks -> create', async () => {
    service.create.mockResolvedValue({ id: 't2', title: 'Nova' } as any)
    const dto = { title: 'Nova' }
    const res = await controller.create({ user: { userId: 'u1' } } as any, dto as any)
    expect(service.create).toHaveBeenCalledWith('u1', dto)
    expect(res).toEqual({ id: 't2', title: 'Nova' })
  })
})


