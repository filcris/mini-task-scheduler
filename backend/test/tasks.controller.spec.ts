import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { TasksController } from '../src/tasks/tasks.controller';
import { TasksService } from '../src/tasks/tasks.service';

describe('TasksController', () => {
  let app: INestApplication;
  let controller: TasksController;
  const service = {
    findAll: jest.fn().mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 10, total: 0 },
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: service }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    controller = moduleRef.get(TasksController);
  });

  it('lista com meta.total', async () => {
    const res = await controller.findAll({ user: { sub: 'u1' } } as any, { page: 1, pageSize: 10 } as any);
    expect(res.meta.total).toBe(0);
  });
});

