import { Module } from '@nestjs/common';
import { UbicacionesClienteService } from './ubicaciones-cliente.service';
import { UbicacionesClienteController } from './ubicaciones-cliente.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { PrismaModule } from 'prisma/prisma.module';
@Module({
  imports: [SupabaseModule, PrismaModule],
  providers: [UbicacionesClienteService],
  controllers: [UbicacionesClienteController],
  exports: [UbicacionesClienteService],
})
export class UbicacionesClienteModule {}
