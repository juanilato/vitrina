// src/ingrediente/ingrediente.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { IngredienteService } from './ingredientes.service';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';

@Controller('ingredientes') // Ruta base: /ingrediente
export class IngredienteController {
  constructor(private readonly ingredienteService: IngredienteService) {}

  
  @Post()
  @HttpCode(201) // Código HTTP 201 Created
  create(@Body() createIngredienteDto: CreateIngredienteDto) {
    // Nota: Aquí necesitarías inyectar el ID de la Empresa, 
    // probablemente de un token de autenticación (Auth Guard).
    // Por simplicidad, asumamos que el DTO incluye 'empresaId' por ahora.
    return this.ingredienteService.create(createIngredienteDto);
  }


    @Get('stats/:empresaId')
  getStats(@Param('empresaId') empresaId: string) {
    // La capa de seguridad/AuthGuard debería verificar que el usuario
    // autenticado coincida con el empresaId solicitado antes de llamar al servicio.
    console.log(`[CONTROLLER] Solicitud de estadísticas para Empresa ID: ${empresaId}`);
    return this.ingredienteService.getIngredientesStats(empresaId);
  }
  @Get()
  findAll(@Param('empresaId') empresaId: string) {
    
    return this.ingredienteService.findAll(empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredienteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngredienteDto: UpdateIngredienteDto) {
    return this.ingredienteService.update(id, updateIngredienteDto);
  }

  @Delete(':id')
  @HttpCode(204) // Código HTTP 204 No Content para eliminaciones exitosas
  remove(@Param('id') id: string) {
    return this.ingredienteService.remove(id);
  }
}