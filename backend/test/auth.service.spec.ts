// test/auth.service.spec.ts
import { Test } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';

// Mock do bcrypt para não depender de hashing real nos testes
jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed_pw'),
  compare: jest.fn(async () => true),
}));

describe('AuthService', () => {
  let auth: AuthService;
  let users: jest.Mocked<UsersService>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(), // <- a tua service expõe "create"
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(async () => 'fake.jwt.token'),
          },
        },
      ],
    }).compile();

    auth = moduleRef.get(AuthService);
    users = moduleRef.get(UsersService) as any;
    jwt = moduleRef.get(JwtService) as any;
  });

  it('register: cria o utilizador e devolve o user', async () => {
    users.create.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      name: null,
    } as any);

    const res = await auth.register('a@a.com', 'secret123', undefined);

    expect(users.create).toHaveBeenCalledWith({
      email: 'a@a.com',
      name: undefined,
      passwordHash: 'hashed_pw',
    });
    // O register devolve o próprio user
    expect(res.email).toBe('a@a.com');
    expect(res.id).toBe('u1');
  });

  it('login: devolve access_token', async () => {
    users.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      name: null,
      passwordHash: 'hashed_pw',
    } as any);

    const res = await auth.login('a@a.com', 'secret123');

    // AuthService chama jwt.signAsync e devolve { access_token }
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@a.com' });
    expect(res.access_token).toBe('fake.jwt.token');
  });
});

