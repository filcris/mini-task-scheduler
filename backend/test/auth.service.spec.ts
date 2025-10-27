import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';

// ✅ Mock consistente de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_pw'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService (legacy unit)', () => {
  let auth: AuthService;

  const users = {
    create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@a.com' }),
    findByEmail: jest.fn().mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      passwordHash: 'hashed_pw',
    }),
  };

  const jwt = {
    signAsync: jest.fn().mockResolvedValue('fake.jwt.token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    auth = moduleRef.get(AuthService);
  });

  it('register', async () => {
    const res = await auth.register('a@a.com', 'secret123', null);
    expect(users.create).toHaveBeenCalledWith('a@a.com', expect.any(String), null);
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@a.com' });
    expect(res.access_token).toBe('fake.jwt.token');
  });

  it('login', async () => {
    const res = await auth.login('a@a.com', 'secret123');
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'a@a.com' });
    expect(res.access_token).toBe('fake.jwt.token');
  });
});






