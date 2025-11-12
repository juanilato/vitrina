import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [PrismaModule, MercadoPagoModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
