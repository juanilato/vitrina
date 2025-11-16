import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from 'prisma/prisma.module';

import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';
import { EmpresasModule } from './empresas/empresas.module';
import { IngredientesModule } from './ingredientes/ingredientes.module';
import { RepartidoresModule } from './repartidores/repartidores.module';
import { UbicacionesClienteModule } from './ubicaciones-cliente/ubicaciones-cliente.module';
import { CategoriasModule } from './categorias/categorias.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ValoracionesModule } from './valoraciones/valoraciones.module';


@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ProductosModule,
    PedidosModule,
    NotificationsModule,
    WebSocketModule,
    EmpresasModule,
    IngredientesModule,
    RepartidoresModule,
    UbicacionesClienteModule,
    CategoriasModule,
    SubscriptionsModule,
    PaymentMethodsModule,
    WebhooksModule,
    ValoracionesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
