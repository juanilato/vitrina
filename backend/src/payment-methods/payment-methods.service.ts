import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoMetodoPago } from '@prisma/client';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async getMetodosPagoByEmpresa(empresaId: string) {
    return this.prisma.metodoPago.findMany({
      where: {
        empresaId,
        activo: true,
      },
      orderBy: [
        { esPredeterminado: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async getMetodoPagoById(id: string) {
    const metodoPago = await this.prisma.metodoPago.findUnique({
      where: { id },
    });

    if (!metodoPago) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    return metodoPago;
  }

  async createMetodoPago(data: {
    empresaId: string;
    tipo: TipoMetodoPago;
    ultimos4?: string;
    marca?: string;
    expiraMes?: number;
    expiraAnio?: number;
    tokenProcesador?: string;
    procesador?: string;
    esPredeterminado?: boolean;
  }) {
    // Si se marca como predeterminado, desmarcar los demás
    if (data.esPredeterminado) {
      await this.prisma.metodoPago.updateMany({
        where: { empresaId: data.empresaId },
        data: { esPredeterminado: false },
      });
    }

    return this.prisma.metodoPago.create({
      data: {
        empresaId: data.empresaId,
        tipo: data.tipo,
        ultimos4: data.ultimos4,
        marca: data.marca,
        expiraMes: data.expiraMes,
        expiraAnio: data.expiraAnio,
        tokenProcesador: data.tokenProcesador,
        procesador: data.procesador || 'stripe',
        esPredeterminado: data.esPredeterminado || false,
        activo: true,
      },
    });
  }

  async setMetodoPagoPredeterminado(id: string, empresaId: string) {
    // Verificar que el método de pago existe y pertenece a la empresa
    const metodoPago = await this.prisma.metodoPago.findFirst({
      where: { id, empresaId },
    });

    if (!metodoPago) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    // Desmarcar todos los métodos de pago como predeterminados
    await this.prisma.metodoPago.updateMany({
      where: { empresaId },
      data: { esPredeterminado: false },
    });

    // Marcar el método de pago seleccionado como predeterminado
    return this.prisma.metodoPago.update({
      where: { id },
      data: { esPredeterminado: true },
    });
  }

  async deleteMetodoPago(id: string, empresaId: string) {
    // Verificar que el método de pago existe y pertenece a la empresa
    const metodoPago = await this.prisma.metodoPago.findFirst({
      where: { id, empresaId },
    });

    if (!metodoPago) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    // Verificar que no esté siendo usado en una suscripción activa
    const suscripcionActiva = await this.prisma.suscripcion.findFirst({
      where: {
        metodoPagoId: id,
        estado: {
          in: ['ACTIVA', 'PENDIENTE_PAGO'],
        },
      },
    });

    if (suscripcionActiva) {
      throw new BadRequestException(
        'No puedes eliminar este método de pago porque está siendo usado en una suscripción activa',
      );
    }

    // Soft delete (marcar como inactivo)
    return this.prisma.metodoPago.update({
      where: { id },
      data: { activo: false },
    });
  }
}
