import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'supersecret',
    })
  }

  async validate(payload: any) {
    // Tudo o que devolvermos aqui fica disponível em req.user
    // e é o que usamos no controller e no service.
    return {
      sub: payload.sub, // ID do utilizador (UUID)
      email: payload.email,
    }
  }
}



