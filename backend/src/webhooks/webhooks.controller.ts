import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('mercadopago')
  async handleMercadoPagoWebhook(
    @Body() body: any,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
  ) {
    this.logger.log('Webhook recibido de MercadoPago');
    this.logger.log('Body:', JSON.stringify(body, null, 2));
    this.logger.log('Signature:', signature);
    this.logger.log('Request ID:', requestId);

    try {
      await this.webhooksService.processMercadoPagoWebhook(body);
      return { received: true };
    } catch (error) {
      this.logger.error('Error procesando webhook:', error);
      // Aún así retornamos 200 para que MercadoPago no reintente
      return { received: true, error: error.message };
    }
  }
}
