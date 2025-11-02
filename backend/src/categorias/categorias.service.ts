import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todas las categorías activas con sus subcategorías
   */
  async findAll() {
    return this.prisma.categoria.findMany({
      where: { activo: true },
      include: {
        subcategorias: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
        },
      },
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Obtener una categoría por ID con sus subcategorías
   */
  async findOne(id: string) {
    return this.prisma.categoria.findUnique({
      where: { id },
      include: {
        subcategorias: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  /**
   * Obtener subcategorías de una categoría
   */
  async findSubcategoriesByCategory(categoryId: string) {
    return this.prisma.subcategoria.findMany({
      where: {
        categoriaId: categoryId,
        activo: true,
      },
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Obtener todas las subcategorías activas
   */
  async findAllSubcategories() {
    return this.prisma.subcategoria.findMany({
      where: { activo: true },
      include: {
        categoria: true,
      },
      orderBy: [
        { categoria: { orden: 'asc' } },
        { orden: 'asc' },
      ],
    });
  }
}
