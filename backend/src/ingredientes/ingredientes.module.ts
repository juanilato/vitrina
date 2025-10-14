import { Module } from '@nestjs/common';
import { IngredienteService } from './ingredientes.service';
import { IngredienteController} from './ingredientes.controller';

import { PrismaService } from 'prisma/prisma.service';

@Module({
  exports: [IngredientesModule],
  controllers: [IngredienteController],
  providers: [IngredienteService, PrismaService],
})
export class IngredientesModule {}
