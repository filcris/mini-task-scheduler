import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock do bcrypt no topo (evita "Cannot redefine property: hash")
jest.mock('bcrypt', () => ({
  __esModule: true,
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService (unit)', () => {
  let auth: AuthService;

  const usersMock = {
    create: jest.fn(),        // (email, passwordHash, name|null)
    findByEmail: jest.fn(),   // (email)
  };

  const jwtMock = {
    signAsync: jest.fn(),     // (payload)
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // valores default dos mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    usersMock.create.mockResolvedValue({ id: 'u1', email: 'a@a.com' });
    usersMock.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      passwordHash: 'hashed_pw',
    });

    jwtMock.signAsync.mockResolvedValue('fake.jwt.token');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    auth = moduleRef.get(AuthService);
  });

  it('register: cria user e devolve { access_token }', async () => {
    const res = await auth.register('a@a.com', 'secret123', null);

    expect(usersMock.create).toHaveBeenCalledTimes(1);
    expect(usersMock.create).toHaveBeenCalledWith('a@a.com', expect.any(String), null);

    expect(jwtMock.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@a.com' });
    expect(res.access_token).toBe('fake.jwt.token');
  });

  it('login: devolve { access_token }', async () => {
    const res = await auth.login('a@a.com', 'secret123');

    expect(usersMock.findByEmail).toHaveBeenCalledWith('a@a.com');
    expect(jwtMock.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@a.com' });
    expect(res.access_token).toBe('fake.jwt.token');
  });
});








