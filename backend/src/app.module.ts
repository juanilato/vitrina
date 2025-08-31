import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from 'prisma/prisma.module';

import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [AuthModule, PrismaModule, ProductosModule, PedidosModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
