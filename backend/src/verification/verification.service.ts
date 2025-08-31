import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Prisma } from '@prisma/client';
type PendingUser = {
  name: string;
  password: string;
  logo?: string;
};
@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}
  //helper privado para usar el Pending user como json
  private asPendingUser(val: Prisma.JsonValue | null | undefined): PendingUser | null {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return val as PendingUser;
      }
      if (typeof val === 'string') {
        try { return JSON.parse(val) as PendingUser; } catch { return null; }
      }
      return null;
    }
  // genera código de verificación
  async generateVerificationCode(email: string, userType: string): Promise<string> {
    // Generar código único de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  // genera registro de verificación
async createVerificationRecord(
    email: string,
    userType: string,
    pendingUserData: PendingUser, 
  ): Promise<string> {
    const code = await this.generateVerificationCode(email, userType);

    // crea el verification code
    await this.prisma.verificationCode.create({
      data: {
        email,
        userType,         
        code,
        pendingUserData,  
        isUsed: false,
        expiresAt: new Date(Date.now() + 1 * 60 * 1000),
      },
    });

    return code;
  }
  // verifica si el código es correcto
  async verifyCode(email: string, code: string, userType: string): Promise<boolean> {
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        userType,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) return false;

    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { isUsed: true },
    });

    // ⬇️ NO hagas JSON.parse directo
    const userData = this.asPendingUser(verificationCode.pendingUserData);

    if (userData) {
      if (userType === 'cliente') {
        await this.prisma.cliente.create({
          data: {
            email,
            name: userData.name,
            password: userData.password,
            isVerified: true,
          },
        });
      } else {
        await this.prisma.empresa.create({
          data: {
            email,
            name: userData.name,
            password: userData.password,
            logo: userData.logo ?? '',
            isVerified: true,
          },
        });
      }
    }

    await this.prisma.verificationCode.deleteMany({
      where: { email, userType },
    });

    return true;
  }

  // envia mail de verificación 
  async sendVerificationEmail(email: string, userName: string, userType: 'cliente' | 'empresa'): Promise<void> {
    // Buscar el código pendiente más reciente
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        userType,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // si existe, envia el mail con el código correspondiente
    if (verificationCode) {
      await this.emailService.sendVerificationEmail(email, verificationCode.code, userName);
    } 
  }

  // envío de mensaje de bienvenida, (email service)
  async sendWelcomeEmail(email: string, userName: string, userType: 'cliente' | 'empresa'): Promise<void> {
    await this.emailService.sendWelcomeEmail(email, userName, userType);
  }

  // limpieza de códigos expirados
  async cleanupExpiredCodes(): Promise<void> {
    // Limpiar códigos expirados (ejecutar periódicamente)
    await this.prisma.verificationCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  // reenvío de código de verificación
  async resendVerificationCode(email: string, userType: string): Promise<void> {
    await this.prisma.verificationCode.updateMany({
      where: { email, userType, isUsed: false },
      data: { isUsed: true },
    });

    const lastPending = await this.prisma.verificationCode.findFirst({
      where: { email, userType },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastPending) return;

    const code = await this.generateVerificationCode(email, userType);

    await this.prisma.verificationCode.create({
      data: {
        email,
        userType,
        code,
        // reusamos el JSON tal cual, sin stringify
        pendingUserData: lastPending.pendingUserData,
        isUsed: false,
        expiresAt: new Date(Date.now() + 1 * 60 * 1000),
      },
    });

    const userData = this.asPendingUser(lastPending.pendingUserData);
    const userName = userData?.name ?? 'Usuario';

    await this.emailService.sendVerificationEmail(email, code, userName);
  }
}
