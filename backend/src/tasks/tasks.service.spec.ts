import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService (unit)', () => {
  let service: TasksService;

  // Mock muito simples do Prisma
  const prismaMock = {
    task: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('findAll: devolve { total, data, items, meta }', async () => {
    // Arrange
    (prismaMock.task.findMany as any).mockResolvedValue([
      {
        id: 't1',
        title: 'Comprar café',
        status: 'todo',
        priority: 'medium',
        dueAt: null,
        description: null,
        ownerId: 'u1',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
    ]);
    (prismaMock.task.count as any).mockResolvedValue(1);

    // Act
    const res = await service.findAll('u1', { page: 1, pageSize: 10 });

    // Assert
    expect(res.total).toBe(1);
    expect(Array.isArray(res.data)).toBe(true);
    expect(Array.isArray(res.items)).toBe(true);
    expect(res.items.length).toBe(1);
    expect(res.meta).toEqual({ page: 1, pageSize: 10, total: 1 });

    // Confirma que findMany foi chamado com take/skip corretos
    const args = (prismaMock.task.findMany as any).mock.calls[0][0];
    expect(args.skip).toBe(0);
    expect(args.take).toBe(10);
    expect(args.where.ownerId).toBe('u1');
  });

  it('findAll: aplica filtro overdue (dueAt < now && status != done)', async () => {
    // Arrange
    (prismaMock.task.findMany as any).mockResolvedValue([]);
    (prismaMock.task.count as any).mockResolvedValue(0);

    // Act
    await service.findAll('u1', { overdue: 'true', limit: 5 });

    // Assert: examinar o "where" passado ao Prisma
    const args = (prismaMock.task.findMany as any).mock.calls[0][0];
    expect(args.take).toBe(5);
    expect(args.skip).toBe(0);
    expect(args.where.ownerId).toBe('u1');

    // AND deve existir como array com 2 entradas: dueAt < now e status != done
    expect(Array.isArray(args.where.AND)).toBe(true);
    const andArr = args.where.AND as any[];

    // status != 'done'
    const statusCond = andArr.find((c) => c?.status?.not === 'done');
    expect(statusCond).toBeDefined();

    // dueAt < now — não verificamos a data exacta, só a presença de lt
    const dueCond = andArr.find((c) => c?.dueAt?.lt instanceof Date);
    expect(dueCond).toBeDefined();
  });
});


