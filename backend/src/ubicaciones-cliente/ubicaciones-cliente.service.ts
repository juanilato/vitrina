import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';

@Injectable()
export class UbicacionesClienteService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todas las ubicaciones de un cliente
   */
  async findAll(clienteId: string) {
    return this.prisma.ubicacionCliente.findMany({
      where: { clienteId },
      orderBy: [
        { esPrincipal: 'desc' }, // Principal primero
        { createdAt: 'desc' },   // Más recientes primero
      ],
    });
  }

  /**
   * Obtener una ubicación específica
   */
  async findOne(id: number, clienteId: string) {
    const ubicacion = await this.prisma.ubicacionCliente.findFirst({
      where: { id, clienteId },
    });

    if (!ubicacion) {
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    }

    return ubicacion;
  }

  /**
   * Crear nueva ubicación
   */
async create(clienteId: string, createUbicacionDto: CreateUbicacionDto) {

  
  // Si esta ubicación será principal, quitar la principal anterior
  if (createUbicacionDto.esPrincipal) {
    await this.prisma.ubicacionCliente.updateMany({
      where: { clienteId, esPrincipal: true },
      data: { esPrincipal: false },
    });
  }

  return this.prisma.ubicacionCliente.create({
    data: {
      nombre: createUbicacionDto.nombre,
      direccion: createUbicacionDto.direccion,
      lat: createUbicacionDto.lat,
      lng: createUbicacionDto.lng,
      referencia: createUbicacionDto.referencia ?? "Sin referencia",
      esPrincipal: createUbicacionDto.esPrincipal ?? false,
      esFavorita: createUbicacionDto.esFavorita ?? false,
      // ✅ Relación correcta
      cliente: {
        connect: { id: createUbicacionDto.clienteId },
      },
    },
  });
}

  /**
   * Actualizar ubicación existente
   */
  async update(id: number, clienteId: string, updateUbicacionDto: UpdateUbicacionDto) {
    // Verificar que la ubicación existe y pertenece al cliente
    await this.findOne(id, clienteId);

    // Si esta ubicación será principal, quitar la principal anterior
    if (updateUbicacionDto.esPrincipal) {
      await this.prisma.ubicacionCliente.updateMany({
        where: {
          clienteId,
          esPrincipal: true,
          id: { not: id }, // Excluir la ubicación actual
        },
        data: { esPrincipal: false },
      });
    }

    return this.prisma.ubicacionCliente.update({
      where: { id },
      data: updateUbicacionDto,
    });
  }

  /**
   * Eliminar ubicación
   */
  async remove(id: number, clienteId: string) {
    // Verificar que la ubicación existe y pertenece al cliente
    await this.findOne(id, clienteId);

    await this.prisma.ubicacionCliente.delete({
      where: { id },
    });

    return { message: 'Ubicación eliminada exitosamente' };
  }

  /**
   * Marcar una ubicación como principal
   */
  async setPrincipal(id: number, clienteId: string) {
    // Verificar que la ubicación existe y pertenece al cliente
    await this.findOne(id, clienteId);

    // Quitar la principal anterior
    await this.prisma.ubicacionCliente.updateMany({
      where: {
        clienteId,
        esPrincipal: true,
        id: { not: id },
      },
      data: { esPrincipal: false },
    });

    // Marcar esta como principal
    return this.prisma.ubicacionCliente.update({
      where: { id },
      data: { esPrincipal: true },
    });
  }

  /**
   * Obtener la ubicación principal del cliente
   */
  async getPrincipal(clienteId: string) {
    const ubicacion = await this.prisma.ubicacionCliente.findFirst({
      where: { clienteId, esPrincipal: true },
    });

    return ubicacion;
  }
}
