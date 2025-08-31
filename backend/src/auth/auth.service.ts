import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterClienteDto, RegisterEmpresaDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto, TokenPayloadDto } from './dto/token.dto';
import { VerifyCodeDto, VerificationResponseDto } from './dto/verification.dto';
import { jwtConfig } from '../config/jwt.config';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private verificationService: VerificationService
  ) {}

  // Método para iniciar sesión
  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario en ambas tablas
    let user = await this.prisma.cliente.findUnique({
      where: { email }
    });

    let userType = 'cliente';

    if (!user) {
      user = await this.prisma.empresa.findUnique({
        where: { email }
      });
      userType = 'empresa';
    }

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que la cuenta esté verificada
    if (!user.isVerified) {
      throw new UnauthorizedException('Cuenta no verificada. Por favor verifica tu email antes de iniciar sesión.');
    }

    // Verificar contraseña (hashed)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email, userType);

    // Retornar respuesta con tokens
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 80 * 60, // 80 minutos en segundos
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: userType
      }
    };
  }

  // registro de cliente
  async registerCliente(registerClienteDto: RegisterClienteDto) {
    // extract data del dto
    const { email, name, password } = registerClienteDto;



    // Verificar si el email ya existe
    const existingUser = await this.prisma.cliente.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si ya hay un código de verificación pendiente
    const existingCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        userType: 'cliente',
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingCode) {
      throw new ConflictException('Ya se envió un código de verificación. Por favor espera 1 minuto o solicita uno nuevo.');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);


    // Preparar datos del usuario pendiente
    const pendingData = {
      name,
      password: hashedPassword,
    };


    // Generar código de verificación
    const code = await this.verificationService.generateVerificationCode(email, 'cliente');
    
    // Guardar datos del usuario pendiente en la tabla de verificación con el código generado
    const verificationRecord = await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        userType: 'cliente',
        expiresAt: new Date(Date.now() + 1 * 60 * 1000),
        isUsed: false,
        pendingUserData: JSON.stringify(pendingData),
      },
    });



    // Enviar email de verificación
    await this.verificationService.sendVerificationEmail(email, name, 'cliente');

    return {
      message: 'Código de verificación enviado. Por favor verifica tu email para completar el registro.',
      email,
      userType: 'cliente'
    };
  }

  // register de la empresa
  async registerEmpresa(registerEmpresaDto: RegisterEmpresaDto) {
    // extrae data de la empresa DTO
    const { email, name, password, logo } = registerEmpresaDto;



    // Verificar si el email ya existe
    const existingUser = await this.prisma.empresa.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si ya hay un código de verificación pendiente
    const existingCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        userType: 'empresa',
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingCode) {
      throw new ConflictException('Ya se envió un código de verificación. Por favor espera 1 minuto o solicita uno nuevo.');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);


    // Preparar datos del usuario pendiente
    const pendingData = {
      name,
      password: hashedPassword,
      logo,
    };


    // Generar código de verificación
    const code = await this.verificationService.generateVerificationCode(email, 'empresa');
    // Guardar datos del usuario pendiente en la tabla de verificación con el código generado
    const verificationRecord = await this.prisma.verificationCode.create({
      data: {
        email,
        code,
        userType: 'empresa',
        expiresAt: new Date(Date.now() + 1 * 60 * 1000),
        isUsed: false,
        pendingUserData: JSON.stringify(pendingData),
      },
    });



    // Enviar email de verificación
    await this.verificationService.sendVerificationEmail(email, name, 'empresa');

    return {
      message: 'Código de verificación enviado. Por favor verifica tu email para completar el registro.',
      email,
      userType: 'empresa'
    };
  }

  // verificación de codigo
  async verifyCode(verifyCodeDto: VerifyCodeDto): Promise<VerificationResponseDto> {
    // extraer datos del DTO verification
    const { email, code, userType } = verifyCodeDto;

    // Verificar el código usando el VerificationService
    const isValid = await this.verificationService.verifyCode(email, code, userType);

    if (!isValid) {
      throw new BadRequestException('Código de verificación inválido o expirado');
    }

    // Buscar el usuario recién creado
    let user;
    if (userType === 'cliente') {
      user = await this.prisma.cliente.findUnique({
        where: { email }
      });
    } else {
      user = await this.prisma.empresa.findUnique({
        where: { email }
      });
    }

    if (!user) {
      throw new BadRequestException('Error al crear la cuenta. Por favor intenta nuevamente.');
    }

    // Enviar email de bienvenida
    await this.verificationService.sendWelcomeEmail(email, user.name, userType);

    const { password: _, ...userWithoutPassword } = user;
    
    // devuelve usuario sin contraseña
    return {
      message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.',
      isVerified: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: userType
      }
    };
  }

  // reenvío de código de verificación
  async resendVerificationCode(email: string, userType: 'cliente' | 'empresa') {
    // Verificar que existe un registro de verificación pendiente
    const existingCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        userType,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!existingCode) {
      throw new BadRequestException('No se encontró un código de verificación pendiente para este email');
    }

    // Reenviar código de verificación
    await this.verificationService.resendVerificationCode(email, userType);

    // devuelve el mensaje
    return {
      message: 'Código de verificación reenviado exitosamente'
    };
  }

  // refresh token
  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      // Verificar el refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConfig.secret,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      });

      // Buscar usuario
      let user;
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

      // Generar nuevos tokens
      const tokens = await this.generateTokens(user.id, user.email, payload.type);

      // devuelve los nuevos tokens
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: 80 * 60,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: payload.type
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  // generar tokens
  private async generateTokens(userId: string, email: string, userType: string) {
    // crea el payload para el token
    const payload: TokenPayloadDto = {
      sub: userId,
      email,
      type: userType,
      iat: Math.floor(Date.now() / 1000),
    };

    // firma los tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: jwtConfig.refreshExpiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      })
    ]);
    // devuelve los tokens, incluyendo el tipo de usuario

    return { accessToken, refreshToken };
  }

  // logout de la sesión
  async logout(userId: string, userType: string): Promise<{ message: string }> {
    // Falta invalidar el refresh token
    // Por ahora solo retornamos un mensaje de éxito
    return { message: 'Logout exitoso' };
  }

  // obtener todas las empresas (para clientes)
  async getCompanies() {
    try {
      const companies = await this.prisma.empresa.findMany({
        where: {
          isVerified: true // Solo empresas verificadas
        },
        select: {
          id: true,
          name: true,
          email: true,
          
          
          isVerified: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return companies;
    } catch (error) {
      throw new BadRequestException('Error al obtener empresas');
    }
  }

  // obtener empresa específica (para clientes)
  async getCompany(id: string) {
    try {
      const company = await this.prisma.empresa.findUnique({
        where: {
          id,
          isVerified: true // Solo empresas verificadas
        },
        select: {
          id: true,
          name: true,
          email: true,
 

          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }

      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener empresa');
    }
  }
}
