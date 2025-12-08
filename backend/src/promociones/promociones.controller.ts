
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Controller('promociones')
export class PromocionesController {
    constructor(private readonly promocionesService: PromocionesService) { }

    @Post()
    create(@Body() createPromocionDto: CreatePromocionDto) {
        return this.promocionesService.create(createPromocionDto);
    }

    @Get('empresa/:empresaId')
    findAllByEmpresa(@Param('empresaId') empresaId: string) {
        return this.promocionesService.findAllByEmpresa(empresaId);
    }

    /**
     * Obtiene solo las promociones activas de una empresa
     * Considera: activo=true, día aplicable, y horario (incluyendo horarios que cruzan medianoche)
     */
    @Get('empresa/:empresaId/activas')
    findActiveByEmpresa(@Param('empresaId') empresaId: string) {
        return this.promocionesService.findActiveByEmpresa(empresaId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePromocionDto: UpdatePromocionDto) {
        return this.promocionesService.update(id, updatePromocionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.promocionesService.remove(id);
    }
}
