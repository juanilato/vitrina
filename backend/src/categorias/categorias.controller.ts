import { Controller, Get, Param } from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  /**
   * GET /categorias
   * Obtener todas las categorías con sus subcategorías
   */
  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  /**
   * GET /categorias/:id
   * Obtener una categoría por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  /**
   * GET /categorias/:id/subcategorias
   * Obtener subcategorías de una categoría
   */
  @Get(':id/subcategorias')
  findSubcategoriesByCategory(@Param('id') id: string) {
    return this.categoriasService.findSubcategoriesByCategory(id);
  }

  /**
   * GET /subcategorias
   * Obtener todas las subcategorías
   */
  @Get('all/subcategorias')
  findAllSubcategories() {
    return this.categoriasService.findAllSubcategories();
  }
}
