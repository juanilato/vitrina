import { Injectable, Logger } from '@nestjs/common';
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';

interface CreateSubscriptionData {
  planId: string;
  planName: string;
  planPrice: number;
  empresaId: string;
  empresaEmail: string;
  empresaName: string;
}

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private preapproval: PreApproval;
  private payment: Payment;
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const backendUrl = process.env.BACKEND_URL;
    const frontendUrl = process.env.FRONTEND_URL;

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }

    if (!backendUrl) {
      throw new Error('BACKEND_URL no configurado');
    }

    if (!frontendUrl) {
      throw new Error('FRONTEND_URL no configurado');
    }

    // Configurar cliente de MercadoPago
    this.client = new MercadoPagoConfig({
      accessToken: accessToken,
    });

    this.preapproval = new PreApproval(this.client);
    this.payment = new Payment(this.client);

    this.logger.log('MercadoPago configurado correctamente');
  }

  /**
   * Crear suscripción (PREAPPROVAL)
   */
  async createSubscription(data: CreateSubscriptionData) {
    try {
      const unitPrice =
        typeof data.planPrice === 'number'
          ? data.planPrice
          : parseFloat(data.planPrice);

      if (isNaN(unitPrice) || unitPrice <= 0) {
        throw new Error(`Precio inválido: ${data.planPrice}`);
      }

      const preapprovalData = {
        reason: `Suscripción ${data.planName}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: unitPrice,
          currency_id: 'ARS',
        },
        payer_email: data.empresaEmail,
        back_url: `${process.env.FRONTEND_URL}/dashboard/account-config?payment=success`,
        external_reference: `${data.empresaId}-${data.planId}-${Date.now()}`,
      };

      this.logger.log(
        'Creando suscripción (preapproval): ' +
          JSON.stringify(preapprovalData, null, 2),
      );

      const response = await this.preapproval.create({
        body: preapprovalData,
      });

      this.logger.log(
        'Preapproval creado correctamente: ' + response.id,
      );

      return {
        id: response.id,
        init_point: response.init_point,
      };
    } catch (error) {
      this.logger.error('Error al crear suscripción:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Obtener un pago (si lo necesitás)
   */
  async getPayment(paymentId: string) {
    try {
      const response = await this.payment.get({ id: paymentId });
      return response;
    } catch (error) {
      this.logger.error(`Error al obtener pago ${paymentId}:`, error);
      throw error;
    }
  }
}
