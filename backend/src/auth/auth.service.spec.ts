// src/auth/auth.service.spec.ts
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed_pw'),
  compare: jest.fn(async () => true),
}));

describe('AuthService (unit)', () => {
  let auth: AuthService;
  let prisma: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(async () => 'fake.jwt.token'),
          },
        },
      ],
    }).compile();

    auth = moduleRef.get(AuthService);
    jwt = moduleRef.get(JwtService) as any;
  });

  it('register: cria user e devolve dados públicos', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      name: null,
    });

    const out = await auth.register('a@a.com', 'secret123');

    expect(prisma.user.create).toHaveBeenCalled();
    expect(out.id).toBe('u1');
    expect(out.email).toBe('a@a.com');
    // Não validamos passwordHash porque não deve ser exposta
  });

  it('login: devolve { access_token }', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      name: null,
      passwordHash: 'hashed_pw',
    });

    const res = await auth.login('a@a.com', 'secret123');

    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@a.com' });
    expect(res.access_token).toBe('fake.jwt.token'); // nome correto
  });
});


