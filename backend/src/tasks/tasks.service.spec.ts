import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';
import { MockPrismaService } from '../../test/__mocks__/prisma.service';

describe('TasksService (unit)', () => {
  let service: TasksService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useClass: MockPrismaService },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
    prisma = moduleRef.get(PrismaService) as unknown as MockPrismaService;
  });

  it('findAll devolve { data, meta }', async () => {
    prisma.task.findMany.mockResolvedValue([
      { id: 't1', title: 'A', status: 'todo', priority: 'medium', ownerId: 'u1', createdAt: new Date(), updatedAt: new Date(), dueAt: null, description: null },
    ]);
    prisma.task.count.mockResolvedValue(1);

    const res = await service.findAll('u1', { page: 1, pageSize: 10 } as any);

    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.meta).toEqual({ page: 1, pageSize: 10, total: 1 });
  });
});





