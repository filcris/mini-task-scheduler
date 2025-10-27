import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aceita (email, passwordHash, name?) para compatibilidade com os testes,
   * mas só persiste email+passwordHash (o schema não tem "name").
   */
  async create(email: string, passwordHash: string, _name?: string | null) {
    return this.prisma.user.create({
      data: { email, passwordHash },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}





