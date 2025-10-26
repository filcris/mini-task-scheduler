import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Mantemos a assinatura com `name?`, mas ignoramos porque o modelo não tem esse campo
  async create(email: string, passwordHash: string, _name?: string | null) {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  }

  // Helper opcional para seeds/fixtures
  async createWithPlainPassword(email: string, password: string, name?: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.create(email, passwordHash, name);
  }
}




