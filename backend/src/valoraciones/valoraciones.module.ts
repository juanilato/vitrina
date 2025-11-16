import { Module } from '@nestjs/common';
import { ValoracionesService } from './valoraciones.service';
import { ValoracionesController } from './valoraciones.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ValoracionesService],
  controllers: [ValoracionesController],
  exports: [ValoracionesService],
})
export class ValoracionesModule {}
