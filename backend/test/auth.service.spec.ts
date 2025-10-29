import { AuthService } from '../src/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

// Mock mínimo do Prisma usado pelo AuthService
const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as any

describe('AuthService', () => {
  let service: AuthService
  let jwt: JwtService

  beforeEach(() => {
    jest.resetAllMocks()
    jwt = new JwtService({ secret: 'test-secret' })
    service = new AuthService(prisma as any, jwt)
  })

  it('faz login com credenciais válidas', async () => {
    const password = 'password123'
    const passwordHash = await bcrypt.hash(password, 10)

    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      passwordHash,
    })

    const result = await service.login('test@example.com', password)
    expect(result).toHaveProperty('access_token')
    expect(typeof result.access_token).toBe('string')
  })

  it('falha com password errada', async () => {
    const passwordHash = await bcrypt.hash('right-pass', 10)
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      passwordHash,
    })

    await expect(service.login('test@example.com', 'wrong-pass'))
      .rejects.toThrow()
  })

  it('falha quando utilizador não existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    await expect(service.login('ghost@example.com', 'any'))
      .rejects.toThrow()
  })
})









