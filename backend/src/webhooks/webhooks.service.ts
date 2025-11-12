import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { EstadoSuscripcion } from '@prisma/client';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private mercadoPagoService: MercadoPagoService,
  ) {}

  async processMercadoPagoWebhook(webhookData: any) {
    this.logger.log('Procesando webhook de MercadoPago');

    // Tipos de notificaciones de MercadoPago:
    // - payment: Pago creado/actualizado
    // - plan: Plan de suscripción creado/actualizado
    // - subscription: Suscripción creada/actualizada

    const { type, action, data } = webhookData;

    this.logger.log(`Tipo: ${type}, Acción: ${action}`);

    if (type === 'payment') {
      await this.handlePaymentNotification(data.id);
    }

    // Puedes agregar más handlers aquí para otros tipos de notificaciones
  }

  private async handlePaymentNotification(paymentId: string) {
    try {
      this.logger.log(`Procesando notificación de pago: ${paymentId}`);

      // Obtener información del pago desde MercadoPago
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      this.logger.log('Pago obtenido:', JSON.stringify(payment, null, 2));

      // Extraer el external_reference que contiene empresaId y planId
      const externalReference = payment.external_reference;
      if (!externalReference) {
        this.logger.warn('El pago no tiene external_reference');
        return;
      }

      // Format: empresaId-planId-timestamp
      const [empresaId, planId] = externalReference.split('-');

      if (!empresaId || !planId) {
        this.logger.warn('External reference no tiene el formato correcto');
        return;
      }

      // Verificar el estado del pago
      if (payment.status === 'approved') {
        this.logger.log(`Pago aprobado para empresa ${empresaId}, plan ${planId}`);

        // Buscar si ya existe una suscripción activa
        const suscripcionExistente = await this.prisma.suscripcion.findFirst({
          where: {
            empresaId,
            estado: {
              in: [EstadoSuscripcion.ACTIVA, EstadoSuscripcion.PENDIENTE_PAGO],
            },
          },
        });

        if (suscripcionExistente) {
          this.logger.log('Ya existe una suscripción activa, actualizando...');
          // Actualizar la suscripción existente si está en estado pendiente
          if (suscripcionExistente.estado === EstadoSuscripcion.PENDIENTE_PAGO) {
            await this.prisma.suscripcion.update({
              where: { id: suscripcionExistente.id },
              data: { estado: EstadoSuscripcion.ACTIVA },
            });
          }
        } else {
          // Crear nueva suscripción
          this.logger.log('Creando nueva suscripción...');

          const plan = await this.prisma.planSuscripcion.findUnique({
            where: { id: planId },
          });

          if (!plan) {
            this.logger.error(`Plan ${planId} no encontrado`);
            return;
          }

          // Calcular fecha de finalización
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
              empresaId,
              planId,
              estado: EstadoSuscripcion.ACTIVA,
              finalizaAt,
              renovacionAuto: true,
            },
          });

          // Crear el registro de pago
          await this.prisma.pago.create({
            data: {
              suscripcionId: suscripcion.id,
              empresaId,
              monto: plan.precio,
              moneda: plan.moneda,
              estado: 'COMPLETADO',
              periodoInicio: now,
              periodoFin: finalizaAt,
              fechaPago: now,
              referenciaExterna: paymentId,
              procesador: 'mercadopago',
            },
          });

          this.logger.log('Suscripción creada exitosamente');
        }
      } else if (payment.status === 'rejected') {
        this.logger.log(`Pago rechazado para empresa ${empresaId}`);
        // Aquí podrías enviar una notificación al usuario
      } else if (payment.status === 'pending') {
        this.logger.log(`Pago pendiente para empresa ${empresaId}`);
      }
    } catch (error) {
      this.logger.error('Error al procesar notificación de pago:', error);
      throw error;
    }
  }
}
