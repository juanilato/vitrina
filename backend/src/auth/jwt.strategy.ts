import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../config/jwt.config';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenPayloadDto } from './dto/token.dto';

// JWT strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });
  }

  async validate(payload: TokenPayloadDto) {
    // Verificar que el usuario existe en la base de datos
    let user;

    // Busca por tipo de usuario y devuelve el usuario
    if (payload.type === 'cliente') {
      user = await this.prisma.cliente.findUnique({
        where: { id: payload.sub }
      });
    } else if (payload.type === 'empresa') {
      user = await this.prisma.empresa.findUnique({
        where: { id: payload.sub }
      });
    }

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      type: payload.type
    };
  }
}
