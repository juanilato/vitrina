import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePedidoDto, UpdatePedidoDto } from './dto';
import { PedidoWithItems } from './entities/pedido.entity';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  // crea pedido
  async create(createPedidoDto: CreatePedidoDto): Promise<PedidoWithItems> {
    try {
      // Verificar que la empresa existe
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: createPedidoDto.empresaId }
      });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      // Verificar que el cliente existe
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: createPedidoDto.clienteId }
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // Verificar que todos los productos existen y pertenecen a la empresa
      const productIds = createPedidoDto.items.map(item => item.productoId);
      const productos = await this.prisma.productos.findMany({
        where: {
          id: { in: productIds },
          empresaId: createPedidoDto.empresaId,
          activo: true
        }
      });

      if (productos.length !== productIds.length) {
        throw new BadRequestException('Algunos productos no existen o no están activos');
      }

      // Crear el pedido con sus items en una transacción
      const pedido = await this.prisma.$transaction(async (prisma) => {
        // Crear el pedido
        const newPedido = await prisma.pedido.create({
          data: {
            clienteId: createPedidoDto.clienteId,
            empresaId: createPedidoDto.empresaId,
            estado: 'pendiente',
          }
        });

        // Crear los items del pedido
        const itemsData = createPedidoDto.items.map(item => ({
          pedidoId: newPedido.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: item.precio,
        }));

        await prisma.itemPedido.createMany({
          data: itemsData
        });

        return newPedido;
      });

      return this.findOne(pedido.id);
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  }

  // obtiene pedidos de un cliente por email
  async findAllByClienteEmail(clienteEmail: string): Promise<PedidoWithItems[]> {
    try {
      const pedidos = await this.prisma.pedido.findMany({
        where: {
          cliente: {
            email: clienteEmail
          }
        },
        include: {
          ItemPedido: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  precio: true
                }
              }
            }
          },
          empresa: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const cliente = await this.prisma.cliente.findUnique({
        where: { email: clienteEmail }
      });

      // Convertir Decimal a number para compatibilidad con el frontend
      return pedidos.map(pedido => ({
        id: pedido.id,
        clienteId: pedido.clienteId,
        clienteNombre: cliente.name,
        clienteEmail: cliente.email,
        empresaId: pedido.empresaId,
        estado: pedido.estado as 'pendiente' | 'en_proceso' | 'finalizado',
        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
        empresa: pedido.empresa,
        items: pedido.ItemPedido.map(item => ({
          id: item.id,
          pedidoId: item.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio.toString()), // Convert Decimal to number
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            precio: parseFloat(item.producto.precio.toString()), // Convert Decimal to number
          }
        })),
        total: pedido.ItemPedido.reduce((sum, item) =>
          sum + (parseFloat(item.precio.toString()) * item.cantidad), 0
        ),
      }));
    } catch (error) {
      throw new BadRequestException('Error al obtener pedidos del cliente');
    }
  }

  // encuentra todos los pedidos de la empresa
  async findAllByEmpresa(empresaId: string): Promise<PedidoWithItems[]> {
    try {
      const pedidos = await this.prisma.pedido.findMany({
        where: { empresaId },
        include: {
          cliente: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          ItemPedido: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  precio: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return pedidos.map(pedido => ({
        id: pedido.id,
        clienteId: pedido.clienteId,
        empresaId: pedido.empresaId,
        estado: pedido.estado,
        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
        cliente: pedido.cliente,
        items: pedido.ItemPedido.map(item => ({
          id: item.id,
          pedidoId: item.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio.toString()),
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            precio: parseFloat(item.producto.precio.toString())
          }
        })),
        total: pedido.ItemPedido.reduce((sum, item) => 
          sum + (parseFloat(item.precio.toString()) * item.cantidad), 0
        )
      }));
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      throw error;
    }
  }

  // encuentra un pedido de la empresa
  async findOne(id: string): Promise<PedidoWithItems> {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id },
        include: {
          cliente: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          ItemPedido: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  precio: true
                }
              }
            }
          }
        }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      return {
        id: pedido.id,
        clienteId: pedido.clienteId,
        empresaId: pedido.empresaId,
        estado: pedido.estado,
        createdAt: pedido.createdAt,
        updatedAt: pedido.updatedAt,
        cliente: pedido.cliente,
        items: pedido.ItemPedido.map(item => ({
          id: item.id,
          pedidoId: item.pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio: parseFloat(item.precio.toString()),
          producto: {
            id: item.producto.id,
            nombre: item.producto.nombre,
            precio: parseFloat(item.producto.precio.toString())
          }
        })),
        total: pedido.ItemPedido.reduce((sum, item) => 
          sum + (parseFloat(item.precio.toString()) * item.cantidad), 0
        )
      };
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      throw error;
    }
  }

  // actualiza los pedidos de la empresa
  async update(id: string, updatePedidoDto: UpdatePedidoDto): Promise<PedidoWithItems> {
    try {
      // Verificar que el pedido existe
      const existingPedido = await this.prisma.pedido.findUnique({
        where: { id }
      });

      if (!existingPedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      // Actualizar el pedido
      await this.prisma.pedido.update({
        where: { id },
        data: updatePedidoDto
      });

      return this.findOne(id);
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      throw error;
    }
  }

  // obtiene las estadisticas de la empresa
  async getStats(empresaId: string) {
    try {
      const [total, pendientes, enProceso, finalizados] = await Promise.all([
        this.prisma.pedido.count({ where: { empresaId } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'pendiente' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'en_proceso' } }),
        this.prisma.pedido.count({ where: { empresaId, estado: 'finalizado' } })
      ]);

      return {
        total,
        pendientes,
        enProceso,
        finalizados
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de pedidos:', error);
      throw error;
    }
  }

  // elimina un pedido de la empresa
  async remove(id: string): Promise<void> {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id }
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      // Eliminar el pedido (los items se eliminan en cascada)
      await this.prisma.pedido.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      throw error;
    }
  }
}
