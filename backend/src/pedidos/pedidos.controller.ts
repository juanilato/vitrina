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

@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  // crea un nuevo pedido
  @Post()
  @Roles('cliente')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPedidoDto: CreatePedidoDto, @Request() req) {
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

  // elimina un pedido
  @Delete(':id')
  @Roles('empresa')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(id);
  }
}
