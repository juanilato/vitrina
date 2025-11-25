import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto, UpdatePedidoDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DeliveryTimeEstimationService, EstimationParams } from './services/delivery-time-estimation.service';

@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly deliveryTimeEstimationService: DeliveryTimeEstimationService,
  ) {}

  // crea un nuevo pedido
  @Post()
  @Roles('cliente')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPedidoDto: CreatePedidoDto, @Request() req) {
    // Debug logging
    console.log('🔍 [Pedidos] User from JWT:', JSON.stringify(req.user, null, 2));
    console.log('🔍 [Pedidos] User type:', req.user?.type);

    // Validar que el usuario esté autenticado
    if (!req.user || !req.user.id) {
      throw new Error('Usuario no autenticado o ID no disponible');
    }

    // Asegurar que el cliente solo pueda crear pedidos para sí mismo
    createPedidoDto.clienteId = req.user.id;

    return this.pedidosService.create(createPedidoDto);
  }

  // obtiene pedidos (para clientes por email, para empresas por empresaId)
  @Get()
  findAll(@Query('clienteEmail') clienteEmail?: string, @Query('empresaId') empresaId?: string, @Request() req?) {
    if (clienteEmail && req.user.type === 'cliente') {
      // Cliente obtiene sus propios pedidos
      return this.pedidosService.findAllByClienteEmail(clienteEmail);
    } else if (empresaId && req.user.type === 'empresa') {
      // Empresa obtiene sus pedidos
      if (req.user.id !== empresaId) {
        throw new Error('No autorizado');
      }
      return this.pedidosService.findAllByEmpresa(empresaId);
    }
    return [];
  }

  // obtiene todos los pedidos de una empresa
  @Get('empresa/:empresaId')
  @Roles('empresa')
  findAllByEmpresa(@Param('empresaId') empresaId: string, @Request() req) {
    // Verificar que la empresa solo pueda ver sus propios pedidos
    if (req.user.id !== empresaId) {
      throw new Error('No autorizado');
    }
    return this.pedidosService.findAllByEmpresa(empresaId);
  }

  // crea un pedido local (desde el restaurante)
  @Post('empresa/local')
  @Roles('empresa')
  @HttpCode(HttpStatus.CREATED)
  createLocalOrder(@Body() createPedidoDto: CreatePedidoDto, @Request() req) {
    console.log('🔍 [Pedidos Local] Creando pedido local:', createPedidoDto);

    // Validar que el usuario esté autenticado como empresa
    if (!req.user || !req.user.id || req.user.type !== 'empresa') {
      throw new Error('Solo empresas pueden crear pedidos locales');
    }

    // Asegurar que la empresa solo pueda crear pedidos para sí misma
    createPedidoDto.empresaId = req.user.id;
    createPedidoDto.origenPedido = 'local';

    return this.pedidosService.create(createPedidoDto);
  }

  // obtiene las estadisticas de los pedidos de la empresa
  @Get('stats/:empresaId')
  @Roles('empresa')
  getStats(@Param('empresaId') empresaId: string, @Request() req) {
    // Verificar que la empresa solo pueda ver sus propias estadísticas
    if (req.user.id !== empresaId) {
      throw new Error('No autorizado');
    }
    return this.pedidosService.getStats(empresaId);
  }

  // obtiene un pedido
  @Get(':id')
  @Roles('empresa', 'cliente')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  // actualiza un pedido
  @Patch(':id')
  @Roles('empresa')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(id, updatePedidoDto);
  }

  // rechaza un pedido (cambia estado a no_confirmado)
  @Patch(':id/reject')
  @Roles('empresa')
  @HttpCode(HttpStatus.OK)
  rejectPedido(@Param('id') id: string, @Body() body: { motivo?: string }) {
    return this.pedidosService.rejectPedido(id, body.motivo);
  }

  // elimina un pedido
  @Delete(':id')
  @Roles('empresa')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(id);
  }

  // obtiene la foto de transferencia de un pedido
  @Get(':id/transferencia-foto')
  @Roles('empresa')
  async getTransferenciaFoto(@Param('id') id: string) {
    const foto = await this.pedidosService.getTransferenciaFoto(id);
    if (!foto) {
      return { error: 'Foto de transferencia no encontrada' };
    }
    return foto;
  }

  // asigna un repartidor a un pedido
  @Post(':id/asignar-repartidor')
  @Roles('empresa')
  @HttpCode(HttpStatus.OK)
  async asignarRepartidor(
    @Param('id') id: string,
    @Body() body: { repartidorId: string },
    @Request() req
  ) {
    return this.pedidosService.asignarRepartidor(id, body.repartidorId, req.user.id);
  }

  // cambia el estado del pedido a "en_camino" (solo repartidor)
  @Patch(':id/en-camino')
  @Roles('repartidor')
  @HttpCode(HttpStatus.OK)
  async marcarEnCamino(@Param('id') id: string, @Request() req) {
    return this.pedidosService.marcarEnCamino(id, req.user.id);
  }

  // cambia el estado del pedido a "entregado" (solo repartidor)
  @Patch(':id/entregado')
  @Roles('repartidor')
  @HttpCode(HttpStatus.OK)
  async marcarEntregado(@Param('id') id: string, @Request() req) {
    return this.pedidosService.marcarEntregado(id, req.user.id);
  }

  // obtiene información del mapa de un pedido (ubicación local, cliente, repartidor)
  @Get(':id/mapa')
  @Roles('empresa', 'cliente', 'repartidor')
  @HttpCode(HttpStatus.OK)
  async obtenerDatosMapa(@Param('id') id: string) {
    return this.pedidosService.obtenerDatosMapa(id);
  }

  // estima el tiempo de entrega antes de crear un pedido
  @Post('estimate-delivery-time')
  @Roles('cliente')
  @HttpCode(HttpStatus.OK)
  async estimarTiempoEntrega(@Body() params: EstimationParams) {
    return this.deliveryTimeEstimationService.calculateEstimation(params);
  }
}
