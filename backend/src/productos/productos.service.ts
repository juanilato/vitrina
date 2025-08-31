import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from 'prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

import { randomUUID } from 'crypto';

@Injectable()
export class ProductosService {
   constructor(
     private prisma: PrismaService,
     private supabase: SupabaseService

   ){}

  // creacion de producto nuevo de la empresa
  async create(createProductoDto: CreateProductoDto) {
    await this.prisma.productos.create({
      data: createProductoDto,
      });

    return;
  }

  // retorna todos los productos de la empresa
  findAll(id: string) {
    return this.prisma.productos.findMany({
      where: { empresaId: id },
    });
  }

  // retorna productos de una empresa específica (para clientes)
  async findByEmpresa(empresaId: string) {
    try {
      const productos = await this.prisma.productos.findMany({
        where: { 
          empresaId,
          // Solo productos activos para clientes
          activo: true
        },
        include: {
          empresa: {
            select: {
              id: true,
              name: true,
              email: true,
              isVerified: true
            }
          }
        },
      });

      return productos;
    } catch (error) {
      throw new BadRequestException('Error al obtener productos de la empresa');
    }
  }

  // retorna un solo producto de la empresa
  findOne(id: string) {
    return this.prisma.productos.findUnique({
      where: { id },
    });
  }

  // actualiza un producto de la empresa
  async update(id: string, updateProductoDto: UpdateProductoDto) {
    const producto = await this.prisma.productos.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    // Si viene nueva fotoPath y hay una anterior, borrá la anterior
    if (
      producto.fotoPath &&
      updateProductoDto.fotoPath &&
      producto.fotoPath !== updateProductoDto.fotoPath
    ) {
      await this.supabase
        .getClient()
        .storage.from('productos')
        .remove([producto.fotoPath]);
    }

    return this.prisma.productos.update({
      where: { id },
      data: updateProductoDto,
    });
  }

  // elimina un producto de la empresa
  async remove(id: string) {
    const producto = await this.prisma.productos.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    // Si tiene foto, borrala del bucket
    if (producto.fotoPath) {
      await this.supabase
        .getClient()
        .storage.from('productos')
        .remove([producto.fotoPath]);
    }

    return this.prisma.productos.delete({ where: { id } });
  }

  // Subir imagen a Supabase Storage
  async uploadImage(file: any, empresaId: string) {
    try {
      // Generar nombre único para el archivo
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${empresaId}/${Date.now()}_${randomUUID()}.${fileExtension}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await this.supabase
        .getClient()
        .storage
        .from('productos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error subiendo archivo a Supabase:', error);
        throw new BadRequestException('Error al subir la imagen: ' + error.message);
      }

      // Obtener URL pública
      const { data: publicUrlData } = this.supabase
        .getClient()
        .storage
        .from('productos')
        .getPublicUrl(fileName);

      return {
        fotoUrl: publicUrlData.publicUrl,
        fotoPath: fileName,
        message: 'Imagen subida exitosamente'
      };
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw new BadRequestException('Error al procesar la imagen');
    }
  }

  // Crear producto con imagen
  async createWithImage(file: any, createData: any) {
    try {
      // Primero subir la imagen
      const imageResult = await this.uploadImage(file, createData.empresaId);
      
      // Crear el producto con la URL de la imagen
      const productoData: CreateProductoDto = {
        ...createData,
        fotoUrl: imageResult.fotoUrl,
        fotoPath: imageResult.fotoPath,
        precio: parseFloat(createData.precio), // Asegurar que sea número
        activo: createData.activo === 'true' // Convertir string a boolean
      };

      const producto = await this.prisma.productos.create({
        data: productoData,
      });

      return producto;
    } catch (error) {
      console.error('Error en createWithImage:', error);
      throw new BadRequestException('Error al crear producto con imagen');
    }
  }

  // Actualizar producto con imagen (borra la anterior automáticamente)
  async updateWithImage(id: string, file: any, updateData: any) {
    try {
      // Buscar el producto existente
      const producto = await this.prisma.productos.findUnique({ where: { id } });
      if (!producto) throw new NotFoundException('Producto no encontrado');

      let imageResult = null;

      // Si hay archivo, subir la nueva imagen
      if (file) {
        // Obtener empresaId del producto existente
        imageResult = await this.uploadImage(file, producto.empresaId);

        // Si había una imagen anterior, borrarla
        if (producto.fotoPath) {
          try {
            await this.supabase
              .getClient()
              .storage.from('productos')
              .remove([producto.fotoPath]);
            console.log('✅ Imagen anterior eliminada:', producto.fotoPath);
          } catch (error) {
            console.error('❌ Error eliminando imagen anterior:', error);
            // No fallar si no se puede eliminar la imagen anterior
          }
        }
      }

      // Preparar datos de actualización
      const updateProductoData: UpdateProductoDto = {
        nombre: updateData.nombre,
        descripcion: updateData.descripcion,
        precio: parseFloat(updateData.precio), // Asegurar que sea número
        activo: updateData.activo === 'true', // Convertir string a boolean
        ...(imageResult && {
          fotoUrl: imageResult.fotoUrl,
          fotoPath: imageResult.fotoPath
        })
      };

      // Actualizar el producto
      const updatedProduct = await this.prisma.productos.update({
        where: { id },
        data: updateProductoData,
      });

      return updatedProduct;
    } catch (error) {
      console.error('Error en updateWithImage:', error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Error al actualizar producto con imagen');
    }
  }

  // Obtener estadísticas de productos por empresa
  async getStats(empresaId: string) {
    const [total, activos, inactivos] = await Promise.all([
      this.prisma.productos.count({ where: { empresaId } }),
      this.prisma.productos.count({ where: { empresaId, activo: true } }),
      this.prisma.productos.count({ where: { empresaId, activo: false } }),
    ]);

    return {
      total,
      activos,
      inactivos
    };
  }

}
