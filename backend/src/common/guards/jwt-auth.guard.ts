import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable() export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const hdr = (req.headers['authorization'] as string|undefined) || '';
    if (!hdr.startsWith('Bearer ')) throw new UnauthorizedException();
    try { const payload = this.jwt.verify(hdr.slice(7), { secret: process.env.JWT_SECRET || 'devsecret' }); req.user = { id: payload.sub, email: payload.email }; return true; }
    catch { throw new UnauthorizedException(); }
  }
}
