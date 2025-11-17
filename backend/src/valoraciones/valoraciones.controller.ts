import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ValoracionesService } from './valoraciones.service';
import { CreateValoracionDto } from './dto/create-valoracion.dto';
import { UpdateValoracionDto } from './dto/update-valoracion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('valoraciones')
export class ValoracionesController {
  constructor(private readonly valoracionesService: ValoracionesService) {}

  /**
   * Crear una nueva valoración (solo clientes autenticados)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createValoracionDto: CreateValoracionDto, @Request() req) {
    // Debug logging
    console.log('🔍 [Valoraciones] User from JWT:', JSON.stringify(req.user, null, 2));
    console.log('🔍 [Valoraciones] User type:', req.user?.type);

    // Verificar que el usuario sea un cliente
    if (req.user.type !== 'cliente') {
      throw new Error('Solo los clientes pueden crear valoraciones');
    }

    return this.valoracionesService.create(createValoracionDto, req.user.id);
  }

  /**
   * Verificar si un pedido puede ser valorado
   */
  @UseGuards(JwtAuthGuard)
  @Get('can-rate/:pedidoId')
  async canBeRated(@Param('pedidoId') pedidoId: string, @Request() req) {
    if (req.user.type !== 'cliente') {
      return { canRate: false, reason: 'Solo los clientes pueden valorar pedidos' };
    }

    return this.valoracionesService.canBeRated(pedidoId, req.user.id);
  }

  /**
   * Obtener valoraciones de una empresa
   */
  @Get('empresa/:empresaId')
  async findByEmpresa(
    @Param('empresaId') empresaId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.valoracionesService.findByEmpresa(empresaId, pageNum, limitNum);
  }

  /**
   * Obtener promedio de calificaciones de una empresa
   */
  @Get('empresa/:empresaId/promedio')
  async getPromedioEmpresa(@Param('empresaId') empresaId: string) {
    return this.valoracionesService.getPromedioEmpresa(empresaId);
  }

  /**
   * Obtener promedio de calificaciones de un repartidor
   */
  @Get('repartidor/:repartidorId/promedio')
  async getPromedioRepartidor(@Param('repartidorId') repartidorId: string) {
    return this.valoracionesService.getPromedioRepartidor(repartidorId);
  }

  /**
   * Obtener valoración de un pedido específico
   */
  @Get('pedido/:pedidoId')
  async findByPedido(@Param('pedidoId') pedidoId: string) {
    return this.valoracionesService.findByPedido(pedidoId);
  }

  /**
   * Obtener todas las valoraciones del cliente autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Get('mis-valoraciones')
  async findMyValoraciones(@Request() req) {
    if (req.user.type !== 'cliente') {
      throw new Error('Solo los clientes tienen valoraciones');
    }

    return this.valoracionesService.findByCliente(req.user.id);
  }

  /**
   * Actualizar una valoración existente
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateValoracionDto: UpdateValoracionDto,
    @Request() req,
  ) {
    if (req.user.type !== 'cliente') {
      throw new Error('Solo los clientes pueden actualizar valoraciones');
    }

    return this.valoracionesService.update(id, updateValoracionDto, req.user.id);
  }
}
