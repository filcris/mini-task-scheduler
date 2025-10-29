import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // se usas @nestjs/passport
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth') // <— sem 'api/' aqui
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: { email: string; password: string; name?: string }) {
    return this.authService.register(dto.email, dto.password, dto.name || null);
  }

  // <-- NOVO
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: Request) {
    // req.user vem da JwtStrategy.validate
    return req.user;
  }
}






