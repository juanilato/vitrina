import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request
} from '@nestjs/common';
import { CategoriasProductoService } from './categorias-producto.service';
import { CreateCategoriaProductoDto } from './dto/create-categoria-producto.dto';
import { UpdateCategoriaProductoDto } from './dto/update-categoria-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categorias-producto')
export class CategoriasProductoController {
  constructor(private readonly categoriasProductoService: CategoriasProductoService) {}

  // Crear nueva categoría (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreateCategoriaProductoDto, @Request() req) {
    // Validar que es una empresa
    if (req.user.type !== 'empresa') {
      throw new Error('Solo empresas pueden crear categorías');
    }

    // Asegurar que tenemos el id del usuario
    if (!req.user.id) {
      throw new Error('Usuario no autenticado correctamente');
    }

    // Usar el ID de la empresa del usuario autenticado
    const data = {
      ...createDto,
      empresaId: req.user.id
    };

    console.log('Creating category with data:', data);
    return this.categoriasProductoService.create(data);
  }

  // Obtener todas las categorías de una empresa (público para vista de clientes)
  @Get('empresa/:empresaId')
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.categoriasProductoService.findByEmpresa(empresaId);
  }

  // Obtener estadísticas de categorías (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Get('stats/:empresaId')
  getStats(@Param('empresaId') empresaId: string, @Request() req) {
    // Validar que pertenece a la empresa
    if (req.user.type !== 'empresa' || req.user.id !== empresaId) {
      throw new Error('No autorizado');
    }
    return this.categoriasProductoService.getStats(empresaId);
  }

  // Reordenar categorías (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Post('reorder/:empresaId')
  reorder(
    @Param('empresaId') empresaId: string,
    @Body() body: { categoriaIds: string[] },
    @Request() req
  ) {
    // Validar que pertenece a la empresa
    if (req.user.type !== 'empresa' || req.user.id !== empresaId) {
      throw new Error('No autorizado');
    }
    return this.categoriasProductoService.reorder(empresaId, body.categoriaIds);
  }

  // Obtener una categoría por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasProductoService.findOne(id);
  }

  // Actualizar categoría (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoriaProductoDto,
    @Request() req
  ) {
    // Aquí podrías agregar validación adicional de permisos si es necesario
    return this.categoriasProductoService.update(id, updateDto);
  }

  // Eliminar categoría (requiere autenticación)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Aquí podrías agregar validación adicional de permisos si es necesario
    return this.categoriasProductoService.remove(id);
  }
}
