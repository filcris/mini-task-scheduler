import { Test } from '@nestjs/testing';
import { TasksController } from 'src/tasks/tasks.controller';
import { TasksService } from 'src/tasks/tasks.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

class MockGuard implements Partial<JwtAuthGuard> {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    req.user = { sub: 'u1', email: 'test@example.com' };
    return true;
  }
}

describe('TasksController', () => {
  let ctrl: TasksController;
  let service: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: { findAll: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockGuard)
      .compile();

    ctrl = moduleRef.get(TasksController);
    service = moduleRef.get(TasksService);
  });

  it('GET /tasks', async () => {
    service.findAll.mockResolvedValue({ items: [], total: 0 });
    const res = await ctrl.findAll({ user: { sub: 'u1' } } as any, { page: 1, pageSize: 10 } as any);
    expect(res.total).toBe(0);
  });
});
