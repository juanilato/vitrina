import { Injectable, Logger } from '@nestjs/common';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

interface CreatePreferenceData {
  planId: string;
  planName: string;
  planPrice: number;
  empresaId: string;
  empresaEmail: string;
  empresaName: string;
}

interface PreferenceItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  currency_id: 'ARS';
  unit_price: number;
}

interface CreatePreferenceBody {
  items: PreferenceItem[];
  payer?: {
    name?: string;
    email?: string;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
}

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private preference: Preference;
  private payment: Payment;
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const backendUrl = process.env.BACKEND_URL;
    const frontendUrl = process.env.FRONTEND_URL;

    if (!accessToken) {
      this.logger.warn('MERCADOPAGO_ACCESS_TOKEN no configurado en el archivo .env');
      return;
    }

    if (!backendUrl) {
      this.logger.error('BACKEND_URL no configurado en el archivo .env - requerido para webhooks de MercadoPago');
      throw new Error('BACKEND_URL no configurado');
    }

    if (!frontendUrl) {
      this.logger.error('FRONTEND_URL no configurado en el archivo .env - requerido para URLs de retorno');
      throw new Error('FRONTEND_URL no configurado');
    }

    // Configurar cliente de MercadoPago
    this.client = new MercadoPagoConfig({
      accessToken: accessToken,
    });

    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);

    this.logger.log('MercadoPago configurado correctamente');
    this.logger.log(`Backend URL: ${backendUrl}`);
    this.logger.log(`Frontend URL: ${frontendUrl}`);
  }

  /**
   * Crear una preferencia de pago para suscripción
   */
  async createPreference(data: CreatePreferenceData) {
    try {
      // Validar que MercadoPago esté configurado
      if (!this.isConfigured()) {
        const errorMsg = 'MercadoPago no está configurado. Verifica que MERCADOPAGO_ACCESS_TOKEN, BACKEND_URL y FRONTEND_URL estén en el .env';
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Asegurar que el precio sea un número válido
      const unitPrice = typeof data.planPrice === 'number'
        ? data.planPrice
        : parseFloat(data.planPrice);

      if (isNaN(unitPrice) || unitPrice <= 0) {
        const errorMsg = `Precio inválido: ${data.planPrice}. El precio debe ser mayor a 0.`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const preferenceData: CreatePreferenceBody = {
        items: [
          {
            id: data.planId,
            title: `Suscripción ${data.planName}`,
            description: `Plan de suscripción ${data.planName}`,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: unitPrice,
          },
        ],
        payer: {
          name: data.empresaName,
          email: data.empresaEmail,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/dashboard/account-config?payment=success`,
          failure: `${process.env.FRONTEND_URL}/dashboard/account-config?payment=failure`,
          pending: `${process.env.FRONTEND_URL}/dashboard/account-config?payment=pending`,
        },
        auto_return: 'approved',
        external_reference: `${data.empresaId}-${data.planId}-${Date.now()}`,
        notification_url: `${process.env.BACKEND_URL}/webhooks/mercadopago`,
      };

      this.logger.log('Creando preferencia de pago:', JSON.stringify(preferenceData, null, 2));

      const response = await this.preference.create({ body: preferenceData });

      this.logger.log('Preferencia creada exitosamente:', response.id);

      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('Error detallado al crear preferencia:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Obtener información de un pago
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

  /**
   * Verificar si MercadoPago está configurado
   */
  isConfigured(): boolean {
    return !!this.client;
  }
}
