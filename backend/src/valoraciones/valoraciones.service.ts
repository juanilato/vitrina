import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateValoracionDto } from './dto/create-valoracion.dto';
import { UpdateValoracionDto } from './dto/update-valoracion.dto';

@Injectable()
export class ValoracionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva valoración para un pedido
   */
  async create(createValoracionDto: CreateValoracionDto, clienteId: string) {
    // 1. Verificar que el pedido existe y pertenece al cliente
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: createValoracionDto.pedidoId },
      include: {
        ItemPedido: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.clienteId !== clienteId) {
      throw new BadRequestException('Este pedido no pertenece al cliente');
    }

    // 2. Verificar que el pedido está entregado
    if (pedido.estado !== 'entregado') {
      throw new BadRequestException('Solo se pueden valorar pedidos entregados');
    }

    // 3. Verificar que no existe ya una valoración para este pedido
    const valoracionExistente = await this.prisma.valoracion.findUnique({
      where: { pedidoId: createValoracionDto.pedidoId },
    });

    if (valoracionExistente) {
      throw new ConflictException('Este pedido ya ha sido valorado');
    }

    // 4. Crear la valoración
    const valoracion = await this.prisma.valoracion.create({
      data: {
        pedidoId: createValoracionDto.pedidoId,
        clienteId: clienteId,
        empresaId: pedido.empresaId,
        repartidorId: pedido.repartidorId,
        calificacionEmpresa: createValoracionDto.calificacionEmpresa,
        comentarioEmpresa: createValoracionDto.comentarioEmpresa,
        aspectosEmpresa: createValoracionDto.aspectosEmpresa || [],
        valoracionProductos: createValoracionDto.valoracionProductos as any || null,
        calificacionRepartidor: createValoracionDto.calificacionRepartidor,
        comentarioRepartidor: createValoracionDto.comentarioRepartidor,
        aspectosRepartidor: createValoracionDto.aspectosRepartidor || [],
      },
      include: {
        pedido: {
          include: {
            empresa: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        cliente: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        repartidor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return valoracion;
  }

  /**
   * Obtener todas las valoraciones de una empresa
   */
  async findByEmpresa(empresaId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [valoraciones, total] = await Promise.all([
      this.prisma.valoracion.findMany({
        where: { empresaId },
        include: {
          cliente: {
            select: {
              name: true,
            },
          },
          pedido: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.valoracion.count({
        where: { empresaId },
      }),
    ]);

    return {
      valoraciones,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener promedio de calificaciones de una empresa
   */
  async getPromedioEmpresa(empresaId: string) {
    const result = await this.prisma.valoracion.aggregate({
      where: { empresaId },
      _avg: {
        calificacionEmpresa: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      promedio: result._avg.calificacionEmpresa || 0,
      totalValoraciones: result._count.id,
    };
  }

  /**
   * Obtener promedio de calificaciones de un repartidor
   */
  async getPromedioRepartidor(repartidorId: string) {
    const result = await this.prisma.valoracion.aggregate({
      where: {
        repartidorId,
        calificacionRepartidor: {
          not: null,
        },
      },
      _avg: {
        calificacionRepartidor: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      promedio: result._avg.calificacionRepartidor || 0,
      totalValoraciones: result._count.id,
    };
  }

  /**
   * Obtener valoración de un pedido específico
   */
  async findByPedido(pedidoId: string) {
    const valoracion = await this.prisma.valoracion.findUnique({
      where: { pedidoId },
      include: {
        cliente: {
          select: {
            name: true,
          },
        },
        empresa: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        repartidor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return valoracion;
  }

  /**
   * Obtener todas las valoraciones de un cliente
   */
  async findByCliente(clienteId: string) {
    const valoraciones = await this.prisma.valoracion.findMany({
      where: { clienteId },
      include: {
        empresa: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        pedido: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return valoraciones;
  }

  /**
   * Actualizar una valoración existente (solo si es del mismo cliente)
   */
  async update(id: string, updateValoracionDto: UpdateValoracionDto, clienteId: string) {
    const valoracion = await this.prisma.valoracion.findUnique({
      where: { id },
    });

    if (!valoracion) {
      throw new NotFoundException('Valoración no encontrada');
    }

    if (valoracion.clienteId !== clienteId) {
      throw new BadRequestException('No tienes permiso para editar esta valoración');
    }

    const updated = await this.prisma.valoracion.update({
      where: { id },
      data: {
        calificacionEmpresa: updateValoracionDto.calificacionEmpresa,
        comentarioEmpresa: updateValoracionDto.comentarioEmpresa,
        aspectosEmpresa: updateValoracionDto.aspectosEmpresa,
        valoracionProductos: updateValoracionDto.valoracionProductos as any,
        calificacionRepartidor: updateValoracionDto.calificacionRepartidor,
        comentarioRepartidor: updateValoracionDto.comentarioRepartidor,
        aspectosRepartidor: updateValoracionDto.aspectosRepartidor,
      },
      include: {
        empresa: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        repartidor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Verificar si un pedido puede ser valorado
   */
  async canBeRated(pedidoId: string, clienteId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return { canRate: false, reason: 'Pedido no encontrado' };
    }

    if (pedido.clienteId !== clienteId) {
      return { canRate: false, reason: 'Este pedido no pertenece al cliente' };
    }

    if (pedido.estado !== 'entregado') {
      return { canRate: false, reason: 'El pedido aún no ha sido entregado' };
    }

    const valoracionExistente = await this.prisma.valoracion.findUnique({
      where: { pedidoId },
    });

    if (valoracionExistente) {
      return { canRate: false, reason: 'Este pedido ya ha sido valorado' };
    }

    return { canRate: true };
  }
}
