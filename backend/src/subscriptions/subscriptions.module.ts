import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [PrismaModule, MercadoPagoModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
