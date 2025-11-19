import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterClienteDto, RegisterEmpresaDto, RegisterRepartidorDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto, TokenPayloadDto } from './dto/token.dto';
import { VerifyCodeDto, VerificationResponseDto } from './dto/verification.dto';
import { jwtConfig } from '../config/jwt.config';
import { VerificationService } from '../verification/verification.service';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
@Injectable()
export class AuthService {
  private google: OAuth2Client;
  private audiences: string[];
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private verificationService: VerificationService
  ) {
 this.audiences = (process.env.GOOGLE_CLIENT_IDS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (this.audiences.length === 0) {
      throw new Error('Falta GOOGLE_CLIENT_IDS en .env');
    }

    // Cualquier clientId sirve para inicializar el cliente
    this.google = new OAuth2Client(this.audiences[0]);

  }

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
      user = await this.prisma.repartidor.findUnique({
        where:{ email }
      });
      userType = 'repartidor';
    }
    if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
    // Verificar que la cuenta esté verificada
    if (!user.isVerified) {
      throw new UnauthorizedException('Cuenta no verificada. Por favor verifica tu email antes de iniciar sesión.');
    }

    // Verificar contraseña (hashed) - SOLO si NO se registró con Google
    if (user.authMethod !== 'google') {
      if (!user.password) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
    } else {
      // Si el usuario se registró con Google, NO puede hacer login con contraseña
      throw new UnauthorizedException('Esta cuenta fue creada con Google. Por favor inicia sesión con Google.');
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

  
async loginWithGoogle(idToken: string, requestedType?: 'cliente' | 'empresa' | 'repartidor')/*: Promise<TokenResponseDto>*/ {
    console.log('🔵 [Google Auth] Iniciando - Tipo solicitado:', requestedType || 'no especificado');

    // 1) Verificar token de Google (firma + audiencia)
    const ticket = await this.google.verifyIdToken({
      idToken,
      audience: this.audiences,
    });
    const payload = ticket.getPayload() as TokenPayload | undefined;
    if (!payload) {
      console.error('❌ [Google Auth] Token inválido');
      throw new UnauthorizedException('Token de Google inválido');
    }

    const { email, name, picture, email_verified, sub } = payload;
    console.log(`✅ [Google Auth] Token verificado - Email: ${email}`);

    // 2) Reglas de seguridad mínimas
    if (!email) throw new UnauthorizedException('Google no devolvió email');
    if (!email_verified) throw new UnauthorizedException('Email de Google no verificado');

    // 3) Buscar usuario en las tres tablas (cliente, empresa, repartidor)
    let user: any = await this.prisma.cliente.findUnique({ where: { email } });
    let userType: 'cliente' | 'empresa' | 'repartidor' = 'cliente';

    if (!user) {
      user = await this.prisma.empresa.findUnique({ where: { email } });
      if (user) userType = 'empresa';
    }

    if (!user) {
      user = await this.prisma.repartidor.findUnique({ where: { email } });
      if (user) userType = 'repartidor';
    }

    // 4) Si NO existe, crear automáticamente con el tipo solicitado (o 'cliente' por defecto)
    if (!user) {
      const typeToCreate = requestedType || 'cliente';
      console.log(`📝 [Google Auth] Creando usuario como: ${typeToCreate}`);

      const password = randomBytes(32).toString('hex');

      // Extraer el nombre de usuario del email (parte antes del @)
      const usernameFromEmail = email.split('@')[0];

      if (typeToCreate === 'cliente') {
        user = await this.prisma.cliente.create({
          data: {
            email,
            name: name || '',
            password,
            authMethod: 'google',
            isVerified: true,
          },
        });
        userType = 'cliente';
      } else if (typeToCreate === 'empresa') {
        user = await this.prisma.empresa.create({
          data: {
            email,
            name: usernameFromEmail,
            password,
            authMethod: 'google',
            isVerified: true,
            logo: picture || null,
          },
        });
        userType = 'empresa';
      } else {
        // repartidor - generar código de vinculación único
        let codigoVinculo: string;
        let isUnique = false;

        while (!isUnique) {
          codigoVinculo = [...Array(6)]
            .map(() => Math.random().toString(36).charAt(2).toUpperCase())
            .join('');

          const existingCodigo = await this.prisma.repartidor.findFirst({
            where: { codigoVinculo },
          });

          if (!existingCodigo) {
            isUnique = true;
          }
        }

        user = await this.prisma.repartidor.create({
          data: {
            email,
            name: name || '',
            password,
            authMethod: 'google',
            isVerified: true,
            codigoVinculo,
          },
        });
        userType = 'repartidor';
      }
      console.log(`✅ [Google Auth] Usuario creado con ID: ${user.id}`);
    } else {
      console.log(`✅ [Google Auth] Usuario existente - Tipo: ${userType}`);
    }

    // 5) Solo marcar como verificada si no lo estaba (NO actualizar nombre ni foto)
    const updateData: any = {};

    // Solo actualizar isVerified si es false
    if (user.isVerified === false) {
      updateData.isVerified = true;
    }

    if (Object.keys(updateData).length > 0) {
      console.log(`🔄 [Google Auth] Marcando usuario como verificado`);
      if (userType === 'cliente') {
        user = await this.prisma.cliente.update({ where: { id: user.id }, data: updateData });
      } else if (userType === 'empresa') {
        user = await this.prisma.empresa.update({ where: { id: user.id }, data: updateData });
      } else {
        user = await this.prisma.repartidor.update({ where: { id: user.id }, data: updateData });
      }
    }

    // 6) Generar tokens
    console.log(`🎫 [Google Auth] Generando tokens`);
    const tokens = await this.generateTokens(user.id, user.email, userType);

    // 7) Respuesta
    console.log(`✅ [Google Auth] Completado exitosamente`);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 80 * 60,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: userType,
        logo: userType === 'empresa' ? user.logo : undefined,
      },
    };
  }
async registerWithGoogle(idToken: string, type: 'cliente' | 'empresa' | 'repartidor') {
    // 1) Verificar token de Google
    const ticket = await this.google.verifyIdToken({
      idToken,
      audience: this.audiences,
    });
    const payload = ticket.getPayload() as TokenPayload | undefined;
    if (!payload) throw new UnauthorizedException('Token de Google inválido');

    const { email, name, picture, email_verified } = payload || {};
    if (!email) throw new UnauthorizedException('Google no devolvió email');
    if (!email_verified) throw new UnauthorizedException('Email de Google no verificado');

    // 2) Debe NO existir en ninguna tabla
    const existsCliente = await this.prisma.cliente.findUnique({ where: { email } });
    const existsEmpresa = await this.prisma.empresa.findUnique({ where: { email } });
    const existsRepartidor = await this.prisma.repartidor.findUnique({ where: { email } });

    if (existsCliente || existsEmpresa || existsRepartidor) {
      throw new BadRequestException('El email ya está registrado. Probá iniciar sesión con Google.');
    }

    // 3) Crear según type, isVerified = true
    // Tu modelo exige password: guardamos string vacío (o un hash dummy)
    const password = randomBytes(32).toString('hex');
    let created: any;

    // Extraer el nombre de usuario del email (parte antes del @)
    const usernameFromEmail = email.split('@')[0];

    if (type === 'cliente') {
      created = await this.prisma.cliente.create({
        data: {
          email,
          name: name ?? '',
          password,
          authMethod: 'google', // ✅ Marcar que se registró con Google
          isVerified: true,
        },
      });
    } else if (type === 'empresa') {
      created = await this.prisma.empresa.create({
        data: {
          email,
          name: usernameFromEmail,
          password,
          authMethod: 'google', // ✅ Marcar que se registró con Google
          isVerified: true,
          logo: picture ?? null,
        },
      });
    } else {
      // repartidor
      // 🧩 Generar un código de vinculación único
      let codigoVinculo: string;
      let isUnique = false;

      while (!isUnique) {
        codigoVinculo = [...Array(6)]
          .map(() => Math.random().toString(36).charAt(2).toUpperCase())
          .join('');

        const existingCodigo = await this.prisma.repartidor.findFirst({
          where: { codigoVinculo },
        });

        if (!existingCodigo) {
          isUnique = true;
        }
      }

      created = await this.prisma.repartidor.create({
        data: {
          email,
          name: name ?? '',
          password,
          authMethod: 'google', // ✅ Marcar que se registró con Google
          isVerified: true,
          codigoVinculo,
        },
      });
    }

    // 4) Opcional A: devolver mismo payload que login (autologin después de registrar)
    const tokens = await this.generateTokens(created.id, created.email, type);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 80 * 60,
      user: {
        id: created.id,
        email: created.email,
        name: created.name,
        type,
      },
    };

    // 4) Opcional B: si NO querés autologin aquí, devolvé solo:
    // return { message: 'Registro con Google exitoso. Ahora podés iniciar sesión.' };
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
    console.log(registerEmpresaDto, "DTO");
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

async registerRepartidor(registerRepartidorDto: RegisterRepartidorDto) {
  const { email, name, password } = registerRepartidorDto;

  // 🔍 Verificar si el email ya existe en repartidores
  const existingUser = await this.prisma.repartidor.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictException('El email ya está registrado');
  }

  // 🔍 Verificar si ya hay un código pendiente
  const existingCode = await this.prisma.verificationCode.findFirst({
    where: {
      email,
      userType: 'repartidor',
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingCode) {
    throw new ConflictException(
      'Ya se envió un código de verificación. Espera 1 minuto o solicita uno nuevo.'
    );
  }

  // 🔐 Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 🧩 Generar un código de vinculación único
  let codigoVinculo: string;
  let isUnique = false;

  while (!isUnique) {
    // genera algo como "A7Z9K3"
    codigoVinculo = [...Array(6)]
      .map(() => Math.random().toString(36).charAt(2).toUpperCase())
      .join('');

    // verifica si ya existe ese código en algún repartidor
    const existingCodigo = await this.prisma.repartidor.findFirst({
      where: { codigoVinculo },
    });

    if (!existingCodigo) {
      isUnique = true;
    }
  }

  // 💾 Preparar datos del usuario pendiente
  const pendingData = {
    email,
    name,
    password: hashedPassword,
    codigoVinculo,
  };

  // 🔢 Generar código de verificación temporal (para email)
  const code = await this.verificationService.generateVerificationCode(
    email,
    'repartidor'
  );

  // 🗄️ Guardar el registro de verificación
  await this.prisma.verificationCode.create({
    data: {
      email,
      code,
      userType: 'repartidor',
      expiresAt: new Date(Date.now() + 1 * 60 * 1000),
      isUsed: false,
      pendingUserData: JSON.stringify(pendingData),
    },
  });

  // 📧 Enviar email
  await this.verificationService.sendVerificationEmail(email, name, 'repartidor');

  // ✅ Respuesta
  return {
    message: 'Código de verificación enviado. Por favor verifica tu email para completar el registro.',
    email,
    userType: 'repartidor',
    codigoVinculo,
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
    } else if (userType === 'empresa') {
      user = await this.prisma.empresa.findUnique({
        where: { email }
      });
    } else if (userType === 'repartidor') {
      user = await this.prisma.repartidor.findUnique({
        where: { email }
      });
    }

    if (!user) {
      throw new BadRequestException('Error al crear la cuenta. Por favor intenta nuevamente.');
    }

    // Enviar email de bienvenida
    await this.verificationService.sendWelcomeEmail(email, user.name, userType);

    // Generar tokens JWT para auto-login
    const tokens = await this.generateTokens(user.id, user.email, userType);

    // devuelve usuario sin contraseña + tokens para auto-login
    return {
      message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.',
      isVerified: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: userType
      },
      // Agregar tokens para auto-login
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 80 * 60
    };
  }

  // reenvío de código de verificación
  async resendVerificationCode(email: string, userType: 'cliente' | 'empresa' | 'repartidor') {
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
        expiresIn: jwtConfig.expiresIn as any,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }),
      this.jwtService.signAsync(payload, {
       expiresIn: jwtConfig.expiresIn as any,
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

  /**
   * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
   * @param lat1 Latitud del primer punto
   * @param lon1 Longitud del primer punto
   * @param lat2 Latitud del segundo punto
   * @param lon2 Longitud del segundo punto
   * @returns Distancia en kilómetros
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
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
          logo: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          categoriaId: true,
          categoria: {
            select: {
              id: true,
              nombre: true,
              icono: true,
            },
          },
          subcategorias: {
            select: {
              subcategoria: {
                select: {
                  id: true,
                  nombre: true,
                  icono: true,
                },
              },
            },
          },
        preferenciasWeb: {
                    select: {
                     
                      dashboardFoto: true,
               
                    },
        },
          Valoraciones: {
            select: {
              calificacionEmpresa: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calcular promedio de valoraciones para cada empresa
      const companiesWithRating = companies.map(company => {
        const valoraciones = company.Valoraciones || [];
        const totalValoraciones = valoraciones.length;
        const rating = totalValoraciones > 0
          ? valoraciones.reduce((sum, v) => sum + v.calificacionEmpresa, 0) / totalValoraciones
          : 0;

        // Remover valoraciones del objeto y agregar rating y reviewCount
        const { Valoraciones: _, ...empresaSinValoraciones } = company;
        return {
          ...empresaSinValoraciones,
          rating: totalValoraciones > 0 ? Number(rating.toFixed(1)) : undefined,
          reviewCount: totalValoraciones > 0 ? totalValoraciones : undefined,
        };
      });

      return companiesWithRating;
    } catch (error) {
      throw new BadRequestException('Error al obtener empresas');
    }
  }

  /**
   * Obtener empresas cercanas a una ubicación específica
   * @param lat Latitud del usuario
   * @param lng Longitud del usuario
   * @param radiusKm Radio de búsqueda en kilómetros (por defecto 10km)
   */
  async getCompaniesByLocation(lat: number, lng: number, radiusKm: number = 10) {
    try {
      // Obtener todas las empresas verificadas con sus ubicaciones
      const companies = await this.prisma.empresa.findMany({
        where: {
          isVerified: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          logo: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          categoriaId: true,
          categoria: {
            select: {
              id: true,
              nombre: true,
              icono: true,
            },
          },
          subcategorias: {
            select: {
              subcategoria: {
                select: {
                  id: true,
                  nombre: true,
                  icono: true,
                },
              },
            },
          },
          preferenciasWeb: {
            select: {
              dashboardFoto: true,
            },
          },
          ubicacion: {
            select: {
              id: true,
              lat: true,
              lng: true,
              direccion: true,
            },
          },
          Valoraciones: {
            select: {
              calificacionEmpresa: true,
            },
          },
        },
      });

      // Filtrar empresas que tengan una ubicación dentro del radio
      const companiesInRange = companies
        .map((company) => {
          // Verificar si la empresa tiene ubicación y si está dentro del rango
          if (!company.ubicacion || !company.ubicacion.lat || !company.ubicacion.lng) {
            return null;
          }

          const distance = this.calculateDistance(
            lat,
            lng,
            company.ubicacion.lat,
            company.ubicacion.lng
          );

          if (distance <= radiusKm) {
            // Calcular rating
            const valoraciones = company.Valoraciones || [];
            const totalValoraciones = valoraciones.length;
            const rating = totalValoraciones > 0
              ? valoraciones.reduce((sum, v) => sum + v.calificacionEmpresa, 0) / totalValoraciones
              : 0;

            const { Valoraciones: _, ...empresaSinValoraciones } = company;
            return {
              ...empresaSinValoraciones,
              distance,
              rating: totalValoraciones > 0 ? Number(rating.toFixed(1)) : undefined,
              reviewCount: totalValoraciones > 0 ? totalValoraciones : undefined,
            };
          }
          return null;
        })
        .filter((company) => company !== null)
        .sort((a, b) => a.distance - b.distance); // Ordenar por distancia

      console.log(`🔍 [GET COMPANIES BY LOCATION] Encontradas ${companiesInRange.length} empresas en un radio de ${radiusKm}km`);
      return companiesInRange;
    } catch (error) {
      console.error('❌ [GET COMPANIES BY LOCATION] Error:', error);
      throw new BadRequestException('Error al obtener empresas cercanas');
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

  // obtener empresa específica con ubicaciones (para clientes)
  async getCompanyWithLocations(id: string) {
    try {


      const company = await this.prisma.empresa.findUnique({
          where: { id,
            isVerified: true,
          },
          include: {
            ubicacion: true,
            preferenciasWeb: {
              include: {
                horarios: true
              }
            },
            productos: true
          }
        });
      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }

      // Remover la contraseña del objeto de respuesta y renombrar ubicacion a ubicaciones (array de 0-1)
      const { password, ubicacion, ...empresaSinPassword } = company as any;
      return {
        ...empresaSinPassword,
        ubicaciones: ubicacion ? [ubicacion] : []
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener empresa');
    }
  }

  // obtener empresa por nombre (público - sin guard)
  async getCompanyByName(name: string) {
    try {
      // Normalizar el nombre recibido (remover espacios)
      const normalizedSearchName = name.replace(/\s+/g, '').toLowerCase();

      // Buscar empresas verificadas
      const companies = await this.prisma.empresa.findMany({
        where: {
          isVerified: true
        },
        include: {
          ubicacion: true,
          preferenciasWeb: {
            include: {
              horarios: true
            }
          }
        }
      });

      // Buscar la empresa que coincida con el nombre normalizado
      const company = companies.find(c =>
        c.name.replace(/\s+/g, '').toLowerCase() === normalizedSearchName
      );

      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }

      // Remover la contraseña del objeto de respuesta
      const { password, ubicacion, ...empresaSinPassword } = company as any;
      return {
        ...empresaSinPassword,
        logo: company.logo,
        redesSociales: company.redesSociales,
        ubicaciones: ubicacion ? [ubicacion] : []
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener empresa');
    }
  }

  // Generar token de preview para live webpage (público - sin guard)
  async generatePreviewToken(empresaId: string): Promise<{ token: string }> {
    // Verificar que la empresa existe
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { id: true, name: true },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Generar token JWT temporal con el ID y nombre de la empresa
    const token = this.jwtService.sign(
      {
        empresaId: empresa.id,
        empresaName: empresa.name,
        type: 'preview',
      },
      {
        expiresIn: '1h', // Token válido por 1 hora
      }
    );

    return { token };
  }

  // Actualizar perfil del cliente
  async updateClientProfile(userId: string, updateData: { name?: string; email?: string }) {
    try {
      // Si se está actualizando el email, verificar que no exista ya
      if (updateData.email) {
        const existingUser = await this.prisma.cliente.findFirst({
          where: {
            email: updateData.email,
            NOT: { id: userId }
          }
        });

        if (existingUser) {
          throw new ConflictException('El email ya está en uso');
        }
      }

      // Actualizar el usuario
      const updatedUser = await this.prisma.cliente.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        message: 'Perfil actualizado exitosamente',
        user: {
          ...updatedUser,
          type: 'cliente'
        }
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar perfil');
    }
  }

  // Cambiar contraseña del cliente
  async updateClientPassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      // Buscar usuario
      const user = await this.prisma.cliente.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar contraseña actual SOLO si NO se registró con Google
      if (user.authMethod !== 'google') {
        if (user.password) {
          const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
          if (!isPasswordValid) {
            throw new UnauthorizedException('Contraseña actual incorrecta');
          }
        }
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña y cambiar authMethod a 'normal' si era Google
      await this.prisma.cliente.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          authMethod: 'normal' // ✅ Cambiar a normal porque ahora tiene contraseña
        }
      });

      return {
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar contraseña');
    }
  }
}
