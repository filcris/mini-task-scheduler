import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../src/prisma/prisma.service';
import { TasksService } from '../src/tasks/tasks.service';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';

import { MockPrismaService } from './__mocks__/prisma.service';

// ✅ Mock do módulo bcrypt logo no topo (evita "Cannot redefine property: hash")
jest.mock('bcrypt', () => ({
  __esModule: true,
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('TasksService', () => {
  let service: TasksService;
  let prisma: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useClass: MockPrismaService },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
    prisma = moduleRef.get(PrismaService);
  });

  it('lista tarefas paginadas e devolve { data, meta }', async () => {
    // Mock dos métodos Prisma usados no service
    prisma.task.findMany.mockResolvedValue([
      {
        id: 't1',
        title: 'Primeira tarefa',
        status: 'todo',
        priority: 'medium',
        dueAt: null,
        description: null,
        ownerId: 'u1',
        createdAt: new Date('2025-10-24T00:00:00Z'),
        updatedAt: new Date('2025-10-24T00:00:00Z'),
      },
    ]);
    prisma.task.count.mockResolvedValue(1);

    const res = await service.findAll('u1', { page: 1, pageSize: 10 } as any);

    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(res.meta).toEqual({ page: 1, pageSize: 10, total: 1 });
  });

  it('cria tarefa para o utilizador', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    prisma.task.create.mockResolvedValue({
      id: 't1',
      title: 'Task',
      status: 'todo',
      priority: 'medium',
      dueAt: null,
      description: null,
      ownerId: 'u1',
      createdAt: new Date('2025-10-24T00:00:00Z'),
      updatedAt: new Date('2025-10-24T00:00:00Z'),
    });

    const res = await service.create('u1', { title: 'Task' } as any);
    expect(res.id).toBe('t1');
    expect(prisma.task.create).toHaveBeenCalled();
  });
});

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Secção "legacy" — testes de Auth no mesmo ficheiro (mantidos, mas limpos)
 * ──────────────────────────────────────────────────────────────────────────────
 */

describe('AuthService (legacy unit)', () => {
  let auth: AuthService;

  // Mocks simples para UsersService e JwtService
  const users = {
    create: jest.fn(), // (email, passwordHash, name|null) => Promise<{ id, email }>
    findByEmail: jest.fn(), // (email) => Promise<{ id, email, passwordHash }|null>
  };

  const jwt = {
    signAsync: jest.fn(), // (payload) => Promise<string>
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Configurar retornos default dos mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    users.create.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
    users.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      passwordHash: 'hashed_pw',
    });

    jwt.signAsync.mockResolvedValue('fake.jwt.token');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    auth = moduleRef.get(AuthService);
  });

  it('register: cria user e devolve { access_token }', async () => {
    const res = await auth.register('a@a.com', 'secret123', null);

    // users.create(email, passwordHash, name|null)
    expect(users.create).toHaveBeenCalledTimes(1);
    expect(users.create).toHaveBeenCalledWith('a@a.com', expect.any(String), null);

    // token assinado com sub/email
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@a.com' });
    expect(res.access_token).toBe('fake.jwt.token');
  });

  it('login: devolve { access_token }', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

    const res = await auth.login('a@a.com', 'secret123');

    expect(users.findByEmail).toHaveBeenCalledWith('a@a.com');
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@a.com' });
    expect(res.access_token).toBe('fake.jwt.token');
  });
});



