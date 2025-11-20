import { Module } from '@nestjs/common';
import { PreferenciasClienteService } from './preferencias-cliente.service';
import { PreferenciasClienteController } from './preferencias-cliente.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PreferenciasClienteService],
  controllers: [PreferenciasClienteController],
  exports: [PreferenciasClienteService],
})
export class PreferenciasClienteModule {}
