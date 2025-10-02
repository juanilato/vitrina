import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreatePrecioEnvioDto } from './dto/create-precio-envio.dto';
import { UpdatePrecioEnvioDto } from './dto/update-precio-envio.dto';
import { CalcularPrecioEnvioDto } from './dto/calcular-precio-envio.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { UpdatePreferenciasDto } from './dto/update-preferencias.dto';

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
      preferenciasWeb: {
        include: {
          horarios: true, // 👈 agregás esto
        },
      },
    },
  });

  if (!empresa) {
    throw new NotFoundException('Empresa no encontrada');
  }

  // Log para debuggear
  console.log('🏢 [EMPRESA] Datos obtenidos:', {
    id: empresa.id,
    name: empresa.name,
    hasUbicacion: !!empresa.ubicacion,
    hasPreferencias: !!empresa.preferenciasWeb,
    horariosCount: empresa.preferenciasWeb?.horarios?.length ?? 0,
  });

  // Remover la contraseña del objeto de respuesta y renombrar ubicacion a ubicaciones
  const { password, ubicacion, ...empresaSinPassword } = empresa as any;

  return {
    ...empresaSinPassword,
    ubicaciones: ubicacion ? [ubicacion] : [],
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
    const { password, ubicacion, ...empresaSinPassword } = empresaActualizada as any;
    return {
      ...empresaSinPassword,
      ubicaciones: ubicacion ? [ubicacion] : [],
    };
  }

async updatePrefenencias(empresaId: string, dto: UpdatePreferenciasDto) {
    // Validaciones simples de rango/consistencia
    for (const h of dto.horarios ?? []) {
    if (h.abreMin >= h.cierraMin) {
      throw new BadRequestException(`Horario inválido ${h.day}#${h.slotIndex}: abreMin >= cierraMin`);
    }
    if (h.abreMin < 0 || h.cierraMin > 1440) {
      throw new BadRequestException(`Horario fuera de rango ${h.day}#${h.slotIndex}`);
    }
  }

  return this.prisma.$transaction(async (tx) => {
    // ⚠️ upsert anidado SIN empresaId en create (lo pone Prisma)
    await tx.empresa.update({
      where: { id: dto.empresaId },
      data: {
        preferenciasWeb: {
          upsert: {
            create: {
              
              colorBotones: dto.colorBotones ?? null,
              colorFondo: dto.colorFondo ?? null,
              envioDomicilio: dto.envioDomicilio,
              dashboardFoto: dto.dashboardFoto ?? null,
            },
            update: {
              colorBotones: dto.colorBotones ?? null,
              colorFondo: dto.colorFondo ?? null,
              envioDomicilio: dto.envioDomicilio,
              dashboardFoto: dto.dashboardFoto ?? null,
            },
          },
        },
      },
      select: { id: true },
    });

    // Sincronizar horarios
    await tx.horarioAtencion.deleteMany({ where: { empresaId } });

    if (dto.horarios?.length) {
      await tx.horarioAtencion.createMany({
        data: dto.horarios.map((h) => ({
          empresaId,           // ✅ aquí sí corresponde
          day: h.day,          // enum DayOfWeek (LUN..DOM)
          slotIndex: h.slotIndex,
          abreMin: h.abreMin,
          cierraMin: h.cierraMin,
          cerrado: h.cerrado,
        })),
        skipDuplicates: true,
      });
    }

    return tx.empresa.findUnique({
      where: { id: empresaId },
      include: {
        preferenciasWeb: true,
        // si querés devolver horarios:
        // horarios: true (si tenés relación), o:
        // horariosAtencion: true (según tu naming)
      },
    });
  });
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
      const { password, ubicacion, ...empresaSinPassword } = empresaActualizada as any;
      return { 
        logoUrl, 
        empresa: {
          ...empresaSinPassword,
          ubicaciones: ubicacion ? [ubicacion] : [],
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

    return empresa.ubicacion ? [empresa.ubicacion] : [];
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

    // En esquema de una sola ubicación, validar que no exista ya
    const existente = await this.prisma.ubicacion.findFirst({
      where: { empresaId: id },
    });
    if (existente) {
      throw new BadRequestException('La empresa ya tiene una ubicación. Edítala en lugar de crear otra.');
    }

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

    // Verificar que no exista ya un precio con la misma distancia para esta ubicación
    const precioExistente = await this.prisma.preciosEnvio.findFirst({
      where: {
        ubicacionId: parseInt(ubicacionId),
        distancia: createPrecioEnvioDto.distancia,
      },
    });

    if (precioExistente) {
      throw new BadRequestException('Ya existe un precio de envío para esta distancia en esta ubicación');
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

  // Método para calcular precio de envío basado en distancia
  async calcularPrecioEnvio(empresaId: string, calcularPrecioEnvioDto: CalcularPrecioEnvioDto) {
    console.log('🚚 [CALCULAR PRECIO ENVIO] Calculando precio:', { empresaId, calcularPrecioEnvioDto });
    
    const { clienteLat, clienteLng, ubicacionId } = calcularPrecioEnvioDto;

    // Verificar que la ubicación pertenece a la empresa
    const ubicacion = await this.prisma.ubicacion.findFirst({
      where: {
        id: ubicacionId,
        empresaId: empresaId,
      },
    });

    if (!ubicacion) {
      throw new NotFoundException('Ubicación no encontrada');
    }

    // Obtener precios de envío para esta ubicación ordenados por distancia
    const preciosEnvio = await this.prisma.preciosEnvio.findMany({
      where: {
        ubicacionId: ubicacionId,
      },
      orderBy: {
        distancia: 'asc',
      },
    });

    if (preciosEnvio.length === 0) {
      // No hay precios configurados
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { name: true }
      });
      
      return {
        price: null,
        isEstimated: false,
        message: `Estimado no disponible. ${empresa?.name || 'La empresa'} confirmará precio de envío.`
      };
    }

    // Calcular distancia entre cliente y ubicación de la empresa
    const distancia = this.calcularDistancia(
      clienteLat, clienteLng,
      ubicacion.lat!, ubicacion.lng!
    );

    console.log('🚚 [CALCULAR PRECIO ENVIO] Distancia calculada:', distancia, 'km');

    // Buscar el rango de precio apropiado
    let precioEnvio = null;
    let isEstimated = false;
    let message = '';

    console.log('🚚 [CALCULAR PRECIO ENVIO] Buscando rango para distancia:', distancia, 'km');
    console.log('🚚 [CALCULAR PRECIO ENVIO] Rangos disponibles:', preciosEnvio.map(p => ({ distancia: p.distancia, precio: p.precio })));

    // Ordenar precios por distancia (ascendente)
    const preciosOrdenados = preciosEnvio.sort((a, b) => a.distancia - b.distancia);
    const distanciaMaxima = preciosOrdenados[preciosOrdenados.length - 1].distancia;

    // 1. Si la distancia es menor o igual al primer rango
    if (distancia <= preciosOrdenados[0].distancia) {
      precioEnvio = Number(preciosOrdenados[0].precio);
      isEstimated = false;
      message = `Precio de envío disponible`;
      console.log('🚚 [CALCULAR PRECIO ENVIO] Caso 1: Dentro del primer rango');
    }
    // 2. Si la distancia está entre rangos
    else if (distancia <= distanciaMaxima) {
      // Buscar el rango apropiado
      for (let i = 0; i < preciosOrdenados.length - 1; i++) {
        if (distancia > preciosOrdenados[i].distancia && distancia <= preciosOrdenados[i + 1].distancia) {
          precioEnvio = Number(preciosOrdenados[i + 1].precio);
          isEstimated = false;
          message = `Precio de envío disponible`;
          console.log('🚚 [CALCULAR PRECIO ENVIO] Caso 2: Entre rangos, usando siguiente rango');
          break;
        }
      }
    }
    // 3. Si excede el rango máximo
    else {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { name: true }
      });
      
      console.log('🚚 [CALCULAR PRECIO ENVIO] Caso 3: Excede rango máximo');
      return {
        price: null,
        isEstimated: false,
        message: `Precio de envío a confirmar. ${empresa?.name || 'La empresa'} te contactará para confirmar el precio de envío.`
      };
    }

    // 4. Si no se encontró precio apropiado (caso de error)
    if (precioEnvio === null) {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { name: true }
      });
      
      console.log('🚚 [CALCULAR PRECIO ENVIO] Caso 4: No se encontró precio apropiado');
      return {
        price: null,
        isEstimated: false,
        message: `Estimado no disponible. ${empresa?.name || 'La empresa'} confirmará precio de envío.`
      };
    }

    console.log('🚚 [CALCULAR PRECIO ENVIO] Precio calculado:', { precioEnvio, isEstimated, message });

    return {
      price: precioEnvio,
      isEstimated,
      message
    };
  }

  // Método auxiliar para calcular distancia usando fórmula de Haversine
  private calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Método temporal para debug - verificar precios de envío
  async debugPreciosEnvio(empresaId: string) {
    console.log('🔍 [DEBUG] Verificando precios de envío para empresa:', empresaId);
    
    // Obtener todas las ubicaciones de la empresa
    const ubicacion = await this.prisma.ubicacion.findFirst({
      where: { empresaId },
      include: { preciosEnvio: true },
    });

    const result = ubicacion
      ? [{
          ubicacionId: ubicacion.id,
          direccion: ubicacion.direccion,
          lat: ubicacion.lat,
          lng: ubicacion.lng,
          preciosEnvio: (ubicacion as any).preciosEnvio.map((precio: any) => ({
            id: precio.id,
            precio: Number(precio.precio),
            distancia: precio.distancia,
          })),
        }]
      : [];

    return {
      empresaId,
      totalUbicaciones: result.length,
      ubicaciones: result,
    };
  }
}
