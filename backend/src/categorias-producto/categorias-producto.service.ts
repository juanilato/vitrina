import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoriaProductoDto } from './dto/create-categoria-producto.dto';
import { UpdateCategoriaProductoDto } from './dto/update-categoria-producto.dto';

@Injectable()
export class CategoriasProductoService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva categoría de producto
  async create(createDto: CreateCategoriaProductoDto) {
    try {
      // Asegurar que empresaId existe
      if (!createDto.empresaId) {
        throw new BadRequestException('empresaId es requerido');
      }

      const data = {
        nombre: createDto.nombre,
        empresaId: createDto.empresaId,
        icono: createDto.icono,
        orden: createDto.orden ?? 0,
        activo: createDto.activo ?? true
      };

      console.log('Prisma create data:', data);

      return await this.prisma.categoriaProducto.create({
        data,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe una categoría con ese nombre para esta empresa');
      }
      throw new BadRequestException('Error al crear la categoría: ' + error.message);
    }
  }

  // Obtener todas las categorías de una empresa
  async findByEmpresa(empresaId: string) {
    return await this.prisma.categoriaProducto.findMany({
      where: { empresaId },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ],
      include: {
        _count: {
          select: { productos: true }
        }
      }
    });
  }

  // Obtener una categoría por ID
  async findOne(id: string) {
    const categoria = await this.prisma.categoriaProducto.findUnique({
      where: { id },
      include: {
        productos: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                precio: true,
                fotoUrl: true,
                activo: true
              }
            }
          }
        }
      }
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return categoria;
  }

  // Actualizar una categoría
  async update(id: string, updateDto: UpdateCategoriaProductoDto) {
    try {
      const categoria = await this.prisma.categoriaProducto.findUnique({
        where: { id }
      });

      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }

      return await this.prisma.categoriaProducto.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === 'P2002') {
        throw new BadRequestException('Ya existe una categoría con ese nombre para esta empresa');
      }
      throw new BadRequestException('Error al actualizar la categoría');
    }
  }

  // Eliminar una categoría
  async remove(id: string) {
    const categoria = await this.prisma.categoriaProducto.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productos: true }
        }
      }
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Advertencia: esto eliminará las relaciones en ProductoCategoria por el CASCADE
    return await this.prisma.categoriaProducto.delete({
      where: { id }
    });
  }

  // Obtener estadísticas de categorías por empresa
  async getStats(empresaId: string) {
    const [total, activas, inactivas] = await Promise.all([
      this.prisma.categoriaProducto.count({ where: { empresaId } }),
      this.prisma.categoriaProducto.count({ where: { empresaId, activo: true } }),
      this.prisma.categoriaProducto.count({ where: { empresaId, activo: false } }),
    ]);

    return {
      total,
      activas,
      inactivas
    };
  }

  // Reordenar categorías
  async reorder(empresaId: string, categoriaIds: string[]) {
    try {
      // Actualizar el orden de cada categoría
      await Promise.all(
        categoriaIds.map((id, index) =>
          this.prisma.categoriaProducto.updateMany({
            where: {
              id,
              empresaId // Asegurar que la categoría pertenece a la empresa
            },
            data: { orden: index }
          })
        )
      );

      return { message: 'Orden actualizado correctamente' };
    } catch (error) {
      throw new BadRequestException('Error al reordenar las categorías');
    }
  }
}
