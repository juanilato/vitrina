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
    // Extraer ingredientes si existen
    const { ingredientes, ...productoData } = createProductoDto as any;
    
    console.log('📝 [PRODUCTOS SERVICE] Creando producto con datos:', {
      ...productoData,
      ingredientes: ingredientes || 'No hay ingredientes'
    });
    
    // Crear el producto
    const producto = await this.prisma.productos.create({
      data: productoData,
    });

    // Si hay ingredientes, crear las relaciones ProductoIngrediente
    if (ingredientes && Array.isArray(ingredientes) && ingredientes.length > 0) {
      console.log('📝 [PRODUCTOS SERVICE] Procesando ingredientes:', ingredientes);
      
      await Promise.all(
        ingredientes.map(async (ing: any) => {
          if (!ing.ingredienteId) {
            console.error('❌ [PRODUCTOS SERVICE] Error: ingredienteId no definido', ing);
            return;
          }
          
          await this.prisma.productoIngrediente.create({
            data: {
              productoId: producto.id,
              ingredienteId: ing.ingredienteId,
              cantidadRequerida: ing.cantidadRequerida || 1,
              esExtraPermitido: ing.esExtraPermitido || false,
            },
          });
        })
      );
    } else {
      console.log('📝 [PRODUCTOS SERVICE] No hay ingredientes para procesar');
    }

    return producto;
  }

  // retorna todos los productos de la empresa
  findAll(id: string) {
    return this.prisma.productos.findMany({
      where: { empresaId: id },
      include: {
        ingredientes: {
          include: {
            ingrediente: {
              select: {
                id: true,
                nombre: true,
                unidadMedida: true,
                icono: true,
                stockDisponible: true
              }
            }
          }
        }
      }
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

    // Extraer ingredientes si existen
    const { ingredientes, ...productoData } = updateProductoDto as any;

    // Si viene nueva fotoPath y hay una anterior, borrá la anterior
    if (
      producto.fotoPath &&
      productoData.fotoPath &&
      producto.fotoPath !== productoData.fotoPath
    ) {
      await this.supabase
        .getClient()
        .storage.from('productos')
        .remove([producto.fotoPath]);
    }

    // Actualizar el producto
    const updatedProducto = await this.prisma.productos.update({
      where: { id },
      data: productoData,
    });

    // Si hay ingredientes, actualizar las relaciones ProductoIngrediente
    if (ingredientes !== undefined) {
      // Primero eliminar todas las relaciones existentes
      await this.prisma.productoIngrediente.deleteMany({
        where: { productoId: id },
      });
      console.log(ingredientes);
      // Luego crear las nuevas relaciones
      if (ingredientes && ingredientes.length > 0) {
        await Promise.all(
          ingredientes.map(async (ing: any) => {
            await this.prisma.productoIngrediente.create({
              data: {
                productoId: id,
                ingredienteId: ing.ingredienteId,
                cantidadRequerida: ing.cantidadRequerida,
                esExtraPermitido: ing.esExtraPermitido || false,
              },
            });
          })
        );
      }
    }

    return updatedProducto;
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

      // Deserializar ingredientes si vienen como string JSON
      let ingredientes = createData.ingredientes;
      if (typeof createData.ingredientes === 'string') {
        try {
          ingredientes = JSON.parse(createData.ingredientes);
          console.log('📝 [PRODUCTOS SERVICE] Ingredientes deserializados:', ingredientes);
        } catch (e) {
          console.error('❌ [PRODUCTOS SERVICE] Error al parsear ingredientes:', e);
          ingredientes = [];
        }
      }

      // Extraer ingredientes del resto de los datos
      const { ingredientes: _, ...restData } = createData;

      // Crear el producto con la URL de la imagen
      const productoData = {
        ...restData,
        fotoUrl: imageResult.fotoUrl,
        fotoPath: imageResult.fotoPath,
        precio: parseFloat(createData.precio), // Asegurar que sea número
        activo: createData.activo === 'true', // Convertir string a boolean
        tipoStock: createData.tipoStock || 'individual',
        stockIndividual: createData.stockIndividual ? parseInt(createData.stockIndividual) : null,
        permiteExtras: createData.permiteExtras === 'true'
      };

      // Crear el producto sin ingredientes primero
      const producto = await this.prisma.productos.create({
        data: productoData,
      });

      console.log('✅ [PRODUCTOS SERVICE] Producto creado:', producto.id);

      // Si hay ingredientes, crearlos para este producto
      if (ingredientes && Array.isArray(ingredientes) && ingredientes.length > 0) {
        console.log('📝 [PRODUCTOS SERVICE] Creando relaciones ProductoIngrediente:', ingredientes.length);

        for (const ingrediente of ingredientes) {
          if (ingrediente.ingredienteId) {
            await this.prisma.productoIngrediente.create({
              data: {
                productoId: producto.id,
                ingredienteId: ingrediente.ingredienteId,
                cantidadRequerida: ingrediente.cantidadRequerida || 1,
                esExtraPermitido: ingrediente.esExtraPermitido || false
              }
            });
            console.log('✅ [PRODUCTOS SERVICE] ProductoIngrediente creado:', ingrediente.ingredienteId);
          }
        }
      } else {
        console.log('📝 [PRODUCTOS SERVICE] No hay ingredientes para crear');
      }

      return producto;
    } catch (error) {
      console.error('❌ [PRODUCTOS SERVICE] Error en createWithImage:', error);
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

      // Deserializar ingredientes si vienen como string JSON
      let ingredientes = updateData.ingredientes;
      if (typeof updateData.ingredientes === 'string') {
        try {
          ingredientes = JSON.parse(updateData.ingredientes);
          console.log('✏️ [PRODUCTOS SERVICE] Ingredientes deserializados:', ingredientes);
        } catch (e) {
          console.error('❌ [PRODUCTOS SERVICE] Error al parsear ingredientes:', e);
          ingredientes = undefined;
        }
      }

      // Extraer ingredientes del resto de los datos
      const { ingredientes: _, ...restData } = updateData;

      // Preparar datos de actualización
      const updateProductoData = {
        nombre: restData.nombre,
        descripcion: restData.descripcion,
        precio: parseFloat(restData.precio), // Asegurar que sea número
        activo: restData.activo === 'true', // Convertir string a boolean
        tipoStock: restData.tipoStock || producto.tipoStock,
        stockIndividual: restData.stockIndividual ? parseInt(restData.stockIndividual) : producto.stockIndividual,
        permiteExtras: restData.permiteExtras === 'true' || producto.permiteExtras,
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

      console.log('✅ [PRODUCTOS SERVICE] Producto actualizado:', updatedProduct.id);

      // Manejar ingredientes si existen
      if (ingredientes !== undefined) {
        // Eliminar ingredientes existentes
        await this.prisma.productoIngrediente.deleteMany({
          where: { productoId: id }
        });

        console.log('📝 [PRODUCTOS SERVICE] Ingredientes anteriores eliminados');

        // Crear nuevos ingredientes si hay
        if (Array.isArray(ingredientes) && ingredientes.length > 0) {
          console.log('📝 [PRODUCTOS SERVICE] Creando nuevas relaciones ProductoIngrediente:', ingredientes.length);

          for (const ingrediente of ingredientes) {
            if (ingrediente.ingredienteId) {
              await this.prisma.productoIngrediente.create({
                data: {
                  productoId: id,
                  ingredienteId: ingrediente.ingredienteId,
                  cantidadRequerida: ingrediente.cantidadRequerida || 1,
                  esExtraPermitido: ingrediente.esExtraPermitido || false
                }
              });
              console.log('✅ [PRODUCTOS SERVICE] ProductoIngrediente actualizado:', ingrediente.ingredienteId);
            }
          }
        } else {
          console.log('📝 [PRODUCTOS SERVICE] No hay ingredientes para crear');
        }
      }

      return updatedProduct;
    } catch (error) {
      console.error('❌ [PRODUCTOS SERVICE] Error en updateWithImage:', error);
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
