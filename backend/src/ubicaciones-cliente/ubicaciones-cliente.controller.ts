import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UbicacionesClienteService } from './ubicaciones-cliente.service';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';

@Controller('ubicaciones-cliente')
@UseGuards(JwtAuthGuard)
export class UbicacionesClienteController {
  constructor(private readonly ubicacionesService: UbicacionesClienteService) {}

  /**
   * GET /ubicaciones-cliente
   * Obtener todas las ubicaciones del cliente autenticado
   */
  @Get()
  findAll(@Request() req) {
    return this.ubicacionesService.findAll(req.user.userId);
  }

  /**
   * GET /ubicaciones-cliente/principal
   * Obtener la ubicación principal del cliente
   */
  @Get('principal')
  getPrincipal(@Request() req) {
    return this.ubicacionesService.getPrincipal(req.user.userId);
  }

  /**
   * GET /ubicaciones-cliente/:id
   * Obtener una ubicación específica
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ubicacionesService.findOne(id, req.user.userId);
  }

  /**
   * POST /ubicaciones-cliente
   * Crear nueva ubicación
   */
  @Post()
  create(@Body() createUbicacionDto: CreateUbicacionDto, @Request() req) {
    return this.ubicacionesService.create(req.user.userId, createUbicacionDto);
  }

  /**
   * PUT /ubicaciones-cliente/:id
   * Actualizar ubicación existente
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUbicacionDto: UpdateUbicacionDto,
    @Request() req,
  ) {
    return this.ubicacionesService.update(id, req.user.userId, updateUbicacionDto);
  }

  /**
   * PUT /ubicaciones-cliente/:id/principal
   * Marcar ubicación como principal
   */
  @Put(':id/principal')
  setPrincipal(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ubicacionesService.setPrincipal(id, req.user.userId);
  }

  /**
   * DELETE /ubicaciones-cliente/:id
   * Eliminar ubicación
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ubicacionesService.remove(id, req.user.userId);
  }
}
