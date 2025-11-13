import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoSuscripcion } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  // ============ PLANES DE SUSCRIPCIÓN ============

  async getAllPlanes() {
    return this.prisma.planSuscripcion.findMany({
      where: { activo: true },
      orderBy: [{ orden: 'asc' }, { precio: 'asc' }],
    });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.planSuscripcion.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }

    return plan;
  }

  // ============ SUSCRIPCIONES ============

  async getSuscripcionByEmpresa(empresaId: string) {
    const suscripcion = await this.prisma.suscripcion.findFirst({
      where: {
        empresaId,
        estado: {
          in: [EstadoSuscripcion.ACTIVA, EstadoSuscripcion.PENDIENTE_PAGO],
        },
      },
      include: {
        plan: true,
        metodoPago: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!suscripcion) {
      throw new NotFoundException('No hay suscripción activa para esta empresa');
    }

    return suscripcion;
  }

  async createSuscripcion(data: {
    empresaId: string;
    planId: string;
    metodoPagoId?: string;
    mercadoPagoData?: {
      preferenceId: string;
      paymentId: string | null;
      externalReference: string;
    };
  }) {
    // Verificar que el plan existe
    const plan = await this.getPlanById(data.planId);

    // Verificar si ya tiene una suscripción activa
    const suscripcionExistente = await this.prisma.suscripcion.findFirst({
      where: {
        empresaId: data.empresaId,
        estado: {
          in: [EstadoSuscripcion.ACTIVA, EstadoSuscripcion.PENDIENTE_PAGO],
        },
      },
    });

    if (suscripcionExistente) {
      throw new BadRequestException('Ya tienes una suscripción activa. Cancélala primero si deseas cambiar de plan.');
    }

    // Calcular fecha de finalización (por ejemplo, 30 días después para mensual)
    const now = new Date();
    const finalizaAt = new Date(now);
    if (plan.intervalo === 'mensual') {
      finalizaAt.setMonth(finalizaAt.getMonth() + 1);
    } else if (plan.intervalo === 'anual') {
      finalizaAt.setFullYear(finalizaAt.getFullYear() + 1);
    }

    // Crear la suscripción
    const suscripcion = await this.prisma.suscripcion.create({
      data: {
        empresaId: data.empresaId,
        planId: data.planId,
        metodoPagoId: data.metodoPagoId,
        estado: EstadoSuscripcion.ACTIVA,
        finalizaAt,
        renovacionAuto: true,
      },
      include: {
        plan: true,
        metodoPago: true,
      },
    });

    // Crear el primer pago
    const pagoData: any = {
      suscripcionId: suscripcion.id,
      empresaId: data.empresaId,
      metodoPagoId: data.metodoPagoId,
      monto: plan.precio,
      moneda: plan.moneda,
      estado: 'COMPLETADO',
      periodoInicio: now,
      periodoFin: finalizaAt,
      fechaPago: now,
    };

    // Si hay datos de MercadoPago, guardarlos en metadata
    if (data.mercadoPagoData) {
      pagoData.metadata = {
        mercadopago: {
          preferenceId: data.mercadoPagoData.preferenceId,
          paymentId: data.mercadoPagoData.paymentId,
          externalReference: data.mercadoPagoData.externalReference,
          processedAt: new Date().toISOString(),
        },
      };
      pagoData.procesador = 'mercadopago';
    }

    await this.prisma.pago.create({ data: pagoData });

    return suscripcion;
  }

  async cancelSuscripcion(suscripcionId: string) {
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
    });

    if (!suscripcion) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    if (suscripcion.estado !== EstadoSuscripcion.ACTIVA) {
      throw new BadRequestException('Esta suscripción no está activa');
    }

    // Cancelar la suscripción pero mantenerla activa hasta la fecha de finalización
    return this.prisma.suscripcion.update({
      where: { id: suscripcionId },
      data: {
        estado: EstadoSuscripcion.CANCELADA,
        canceladaAt: new Date(),
        renovacionAuto: false,
      },
      include: {
        plan: true,
        metodoPago: true,
      },
    });
  }

  async updateMetodoPago(suscripcionId: string, metodoPagoId: string) {
    return this.prisma.suscripcion.update({
      where: { id: suscripcionId },
      data: { metodoPagoId },
      include: {
        plan: true,
        metodoPago: true,
      },
    });
  }

  // ============ HISTORIAL DE PAGOS ============

  async getPagosByEmpresa(empresaId: string) {
    return this.prisma.pago.findMany({
      where: { empresaId },
      include: {
        suscripcion: {
          include: {
            plan: true,
          },
        },
        metodoPago: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPagoById(id: string) {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
      include: {
        suscripcion: {
          include: {
            plan: true,
          },
        },
        metodoPago: true,
      },
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    return pago;
  }
}
