import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

type SignPayload = { sub: string; email: string };
type SignResult = { token: string; access_token: string; id: string; email: string };
type PublicUser = { id: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async signToken(sub: string, email: string): Promise<SignResult> {
    const payload: SignPayload = { sub, email };
    const opts: JwtSignOptions = {}; // podes ajustar expirações aqui
    const token = await this.jwt.signAsync(payload, opts);
    return { token, access_token: token, id: sub, email };
  }

  async register(email: string, password: string, name?: string | null): Promise<SignResult & PublicUser> {
    try {
      const exists = await this.prisma.user.findUnique({ where: { email } });
      if (exists) throw new BadRequestException('Email já registado');

      const passwordHash = await bcrypt.hash(password, 10);
      const created = await this.prisma.user.create({
        data: { email, passwordHash, name: name ?? null },
        select: { id: true, email: true },
      });

      const signed = await this.signToken(created.id, created.email);
      return { ...signed, id: created.id, email: created.email };
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof Error) throw new BadRequestException(err.message);
      throw new BadRequestException('Não foi possível registar');
    }
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const signed = await this.signToken(user.id, user.email);
    return { access_token: signed.access_token };
  }
}












