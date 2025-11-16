import { Controller, Get, Post, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { RepartidoresService } from './repartidores.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VincularEmpresaDto } from './dto/vincular-empresa.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { UpdateUbicacionRepartidorDto } from './dto/update-ubicacion-repartidor.dto';

@Controller('repartidores')
@UseGuards(JwtAuthGuard)
export class RepartidoresController {
  constructor(private readonly repartidoresService: RepartidoresService) {}

  @Get('mis-datos')
  async getMisDatos(@Request() req) {
    return this.repartidoresService.getMisDatos(req.user.id);
  }

  @Get('mis-empresas')
  async getMisEmpresas(@Request() req) {
    return this.repartidoresService.getMisEmpresas(req.user.id);
  }

  @Post('aceptar-vinculacion/:id')
  async aceptarVinculacion(@Request() req, @Param('id') id: string) {
    return this.repartidoresService.aceptarVinculacion(req.user.id, parseInt(id));
  }

  @Post('rechazar-vinculacion/:id')
  async rechazarVinculacion(@Request() req, @Param('id') id: string) {
    return this.repartidoresService.rechazarVinculacion(req.user.id, parseInt(id));
  }

  @Get('pedidos-disponibles')
  async getPedidosDisponibles(@Request() req) {
    return this.repartidoresService.getPedidosDisponibles(req.user.id);
  }

  @Post('tomar-pedido/:id')
  async tomarPedido(@Request() req, @Param('id') pedidoId: string) {
    return this.repartidoresService.tomarPedido(req.user.id, pedidoId);
  }

  @Get('mis-pedidos')
  async getMisPedidos(@Request() req) {
    return this.repartidoresService.getMisPedidos(req.user.id);
  }

  @Patch('pedidos/:id/estado')
  async updateEstadoPedido(
    @Request() req,
    @Param('id') pedidoId: string,
    @Body() dto: UpdateEstadoPedidoDto,
  ) {
    return this.repartidoresService.updateEstadoPedido(req.user.id, pedidoId, dto);
  }

  @Patch('pedidos/:id/ubicacion')
  async updateUbicacionRepartidor(
    @Request() req,
    @Param('id') pedidoId: string,
    @Body() dto: UpdateUbicacionRepartidorDto,
  ) {
    return this.repartidoresService.updateUbicacionRepartidor(req.user.id, pedidoId, dto);
  }
}

