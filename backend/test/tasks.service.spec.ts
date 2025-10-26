import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksService } from 'src/tasks/tasks.service';

import { MockPrismaService } from './__mocks__/prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useClass: MockPrismaService }],
    }).compile();
    service = moduleRef.get(TasksService);
    prisma = moduleRef.get(PrismaService);
  });

  it('lista tarefas', async () => {
    prisma.task.findMany.mockResolvedValue([{ id: 't1', title: 'A' }]);
    prisma.task.count.mockResolvedValue(1);
    const res = await service.findAll('u1', { page: 1, pageSize: 10 });
    expect(res.items).toHaveLength(1);
  });

  it('cria tarefa', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 'u1' });
    prisma.task.create.mockResolvedValue({ id: 't1', title: 'Task' });
    const res = await service.create('u1', { title: 'Task' } as any);
    expect(res.id).toBe('t1');
  });
});
