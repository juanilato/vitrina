import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreatePrecioEnvioDto } from './dto/create-precio-envio.dto';
import { UpdatePrecioEnvioDto } from './dto/update-precio-envio.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

@Injectable()
export class EmpresasService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService
  ) {}

  async findOne(id: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        ubicacion: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Log para debuggear
    console.log('🏢 [EMPRESA] Datos obtenidos:', {
      id: empresa.id,
      name: empresa.name,
      ubicacionesCount: empresa.ubicacion?.length || 0,
      ubicaciones: empresa.ubicacion
    });

    // Remover la contraseña del objeto de respuesta y renombrar ubicacion a ubicaciones
    const { password, ubicacion, ...empresaSinPassword } = empresa;
    return {
      ...empresaSinPassword,
      ubicaciones: ubicacion || []
    };
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const empresaActualizada = await this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
      include: {
        ubicacion: true,
      },
    });

    // Remover la contraseña del objeto de respuesta y renombrar ubicacion a ubicaciones
    const { password, ubicacion, ...empresaSinPassword } = empresaActualizada;
    return {
      ...empresaSinPassword,
      ubicaciones: ubicacion || []
    };
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, empresa.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.empresa.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async uploadLogo(id: string, file: any) {
    console.log('🔍 [UPLOAD LOGO SERVICE] Buscando empresa:', id);
    
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      console.error('❌ [UPLOAD LOGO SERVICE] Empresa no encontrada:', id);
      throw new NotFoundException('Empresa no encontrada');
    }

    console.log('✅ [UPLOAD LOGO SERVICE] Empresa encontrada:', empresa.name);

    try {
      // Generar nombre único para el archivo
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${id}/logo/${Date.now()}_${randomUUID()}.${fileExtension}`;
      
      console.log('📝 [UPLOAD LOGO SERVICE] Nombre de archivo generado:', fileName);

      // Subir archivo a Supabase Storage
      console.log('☁️ [UPLOAD LOGO SERVICE] Subiendo a Supabase Storage...');
      const { data, error } = await this.supabase
        .getClient()
        .storage
        .from('logos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ [UPLOAD LOGO SERVICE] Error subiendo logo a Supabase:', error);
        throw new BadRequestException('Error al subir el logo: ' + error.message);
      }

      console.log('✅ [UPLOAD LOGO SERVICE] Archivo subido exitosamente:', data);

      // Obtener URL pública
      console.log('🔗 [UPLOAD LOGO SERVICE] Obteniendo URL pública...');
      const { data: publicUrlData } = this.supabase
        .getClient()
        .storage
        .from('logos')
        .getPublicUrl(fileName);

      const logoUrl = publicUrlData.publicUrl;
      console.log('🌐 [UPLOAD LOGO SERVICE] URL pública generada:', logoUrl);

      // Actualizar empresa con nueva URL del logo
      console.log('💾 [UPLOAD LOGO SERVICE] Actualizando empresa en base de datos...');
      const empresaActualizada = await this.prisma.empresa.update({
        where: { id },
        data: { logo: logoUrl },
        include: {
          ubicacion: true,
        },
      });

      console.log('✅ [UPLOAD LOGO SERVICE] Empresa actualizada exitosamente');

      // Remover la contraseña del objeto de respuesta y renombrar ubicacion a ubicaciones
      const { password, ubicacion, ...empresaSinPassword } = empresaActualizada;
      return { 
        logoUrl, 
        empresa: {
          ...empresaSinPassword,
          ubicaciones: ubicacion || []
        }
      };
    } catch (error) {
      console.error('❌ [UPLOAD LOGO SERVICE] Error en uploadLogo:', error);
      throw new BadRequestException('Error al procesar el logo: ' + error.message);
    }
  }

  // Métodos para ubicaciones
  async getUbicaciones(id: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        ubicacion: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa.ubicacion || [];
  }

  async createUbicacion(id: string, createUbicacionDto: CreateUbicacionDto) {
    console.log('🔍 [CREATE UBICACION SERVICE] Buscando empresa:', id);
    console.log('🔍 [CREATE UBICACION SERVICE] Datos recibidos:', createUbicacionDto);
    
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      console.error('❌ [CREATE UBICACION SERVICE] Empresa no encontrada:', id);
      throw new NotFoundException('Empresa no encontrada');
    }

    console.log('✅ [CREATE UBICACION SERVICE] Empresa encontrada:', empresa.name);

    const ubicacion = await this.prisma.ubicacion.create({
      data: {
        ...createUbicacionDto,
        empresaId: id,
      },
    });

    console.log('✅ [CREATE UBICACION SERVICE] Ubicación creada:', ubicacion);

    return ubicacion;
  }

  async updateUbicacion(id: string, ubicacionId: string, updateUbicacionDto: UpdateUbicacionDto) {
    // Verificar que la ubicación pertenece a la empresa
    const ubicacion = await this.prisma.ubicacion.findFirst({
      where: {
        id: parseInt(ubicacionId),
        empresaId: id,
      },
    });

    if (!ubicacion) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    const ubicacionActualizada = await this.prisma.ubicacion.update({
      where: { id: parseInt(ubicacionId) },
      data: updateUbicacionDto,
    });

    return ubicacionActualizada;
  }

  async removeUbicacion(id: string, ubicacionId: string) {
    // Verificar que la ubicación pertenece a la empresa
    const ubicacion = await this.prisma.ubicacion.findFirst({
      where: {
        id: parseInt(ubicacionId),
        empresaId: id,
      },
    });

    if (!ubicacion) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    await this.prisma.ubicacion.delete({
      where: { id: parseInt(ubicacionId) },
    });

    return { message: 'Ubicación eliminada exitosamente' };
  }

  // Obtener URL del logo de una empresa
  async getLogoUrl(id: string): Promise<string | null> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      select: { logo: true },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa.logo;
  }

  // Obtener datos del logo de una empresa desde Supabase
  async getLogoData(id: string): Promise<{ buffer: Buffer; contentType: string; size: number } | null> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      select: { logo: true },
    });

    if (!empresa || !empresa.logo) {
      return null;
    }

    try {
      // Extraer el path del archivo de la URL de Supabase
      const url = new URL(empresa.logo);
      const pathParts = url.pathname.split('/');
      const bucketName = pathParts[2]; // 'logos'
      const filePath = pathParts.slice(3).join('/'); // resto del path

      console.log('🔍 [GET LOGO DATA] Descargando logo:', { bucketName, filePath });

      // Descargar el archivo desde Supabase Storage
      const { data, error } = await this.supabase
        .getClient()
        .storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error('❌ [GET LOGO DATA] Error descargando logo:', error);
        return null;
      }

      // Convertir Blob a Buffer
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Obtener metadata del archivo
      const { data: fileInfo } = await this.supabase
        .getClient()
        .storage
        .from(bucketName)
        .list(filePath.split('/')[0], {
          search: filePath.split('/').pop(),
        });

      const contentType = fileInfo?.[0]?.metadata?.mimetype || 'image/jpeg';

      console.log('✅ [GET LOGO DATA] Logo descargado exitosamente:', {
        size: buffer.length,
        contentType
      });

      return {
        buffer,
        contentType,
        size: buffer.length
      };
    } catch (error) {
      console.error('❌ [GET LOGO DATA] Error procesando logo:', error);
      return null;
    }
  }

  // Métodos para precios de envío
  async getPreciosEnvio(empresaId: string, ubicacionId: string) {
    console.log('🚚 [GET PRECIOS ENVIO] Buscando precios para ubicación:', { empresaId, ubicacionId });
    
    // Verificar que la ubicación pertenece a la empresa
    const ubicacion = await this.prisma.ubicacion.findFirst({
      where: {
        id: parseInt(ubicacionId),
        empresaId: empresaId,
      },
    });

    if (!ubicacion) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    const precios = await this.prisma.preciosEnvio.findMany({
      where: {
        ubicacionId: parseInt(ubicacionId),
      },
      orderBy: {
        distancia: 'asc',
      },
    });

    console.log('🚚 [GET PRECIOS ENVIO] Precios encontrados:', precios.length);
    return precios;
  }

  async createPrecioEnvio(empresaId: string, ubicacionId: string, createPrecioEnvioDto: CreatePrecioEnvioDto) {
    console.log('🚚 [CREATE PRECIO ENVIO] Creando precio:', { empresaId, ubicacionId, createPrecioEnvioDto });
    
    // Verificar que la ubicación pertenece a la empresa
    const ubicacion = await this.prisma.ubicacion.findFirst({
      where: {
        id: parseInt(ubicacionId),
        empresaId: empresaId,
      },
    });

    if (!ubicacion) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    // Verificar que no existe ya un precio para esta ubicación
    const precioExistente = await this.prisma.preciosEnvio.findFirst({
      where: {
        ubicacionId: parseInt(ubicacionId),
      },
    });

    if (precioExistente) {
      throw new BadRequestException('Ya existe un precio de envío para esta ubicación');
    }

    const precio = await this.prisma.preciosEnvio.create({
      data: {
        ...createPrecioEnvioDto,
        ubicacionId: parseInt(ubicacionId),
        empresaId: empresaId,
      },
    });

    console.log('🚚 [CREATE PRECIO ENVIO] Precio creado:', precio);
    return precio;
  }

  async updatePrecioEnvio(empresaId: string, ubicacionId: string, precioId: string, updatePrecioEnvioDto: UpdatePrecioEnvioDto) {
    console.log('🚚 [UPDATE PRECIO ENVIO] Actualizando precio:', { empresaId, ubicacionId, precioId, updatePrecioEnvioDto });
    
    // Verificar que el precio pertenece a la ubicación y empresa
    const precio = await this.prisma.preciosEnvio.findFirst({
      where: {
        id: parseInt(precioId),
        ubicacionId: parseInt(ubicacionId),
        empresaId: empresaId,
      },
    });

    if (!precio) {
      throw new NotFoundException('Precio de envío no encontrado');
    }

    const precioActualizado = await this.prisma.preciosEnvio.update({
      where: { id: parseInt(precioId) },
      data: updatePrecioEnvioDto,
    });

    console.log('🚚 [UPDATE PRECIO ENVIO] Precio actualizado:', precioActualizado);
    return precioActualizado;
  }

  async removePrecioEnvio(empresaId: string, ubicacionId: string, precioId: string) {
    console.log('🚚 [REMOVE PRECIO ENVIO] Eliminando precio:', { empresaId, ubicacionId, precioId });
    
    // Verificar que el precio pertenece a la ubicación y empresa
    const precio = await this.prisma.preciosEnvio.findFirst({
      where: {
        id: parseInt(precioId),
        ubicacionId: parseInt(ubicacionId),
        empresaId: empresaId,
      },
    });

    if (!precio) {
      throw new NotFoundException('Precio de envío no encontrado');
    }

    await this.prisma.preciosEnvio.delete({
      where: { id: parseInt(precioId) },
    });

    console.log('🚚 [REMOVE PRECIO ENVIO] Precio eliminado exitosamente');
    return { message: 'Precio de envío eliminado exitosamente' };
  }
}
