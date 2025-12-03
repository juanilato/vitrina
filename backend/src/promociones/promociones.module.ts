import { Module } from '@nestjs/common';
import { PromocionesController } from './promociones.controller';
import { PromocionesService } from './promociones.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PromocionesController],
    providers: [PromocionesService],
    exports: [PromocionesService],
})
export class PromocionesModule { }
