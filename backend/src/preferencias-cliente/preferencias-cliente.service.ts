import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePreferenciasDto } from './dto/update-preferencias.dto';

@Injectable()
export class PreferenciasClienteService {
  constructor(private prisma: PrismaService) {}

  async getPreferencias(clienteId: string) {
    let preferencias = await this.prisma.preferenciasCliente.findUnique({
      where: { clienteId },
    });

    // Si no existen preferencias, crear con valores por defecto
    if (!preferencias) {
      preferencias = await this.prisma.preferenciasCliente.create({
        data: {
          clienteId,
        },
      });
    }

    return preferencias;
  }

  async updatePreferencias(
    clienteId: string,
    updateDto: UpdatePreferenciasDto,
  ) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Crear o actualizar preferencias (upsert)
    const preferencias = await this.prisma.preferenciasCliente.upsert({
      where: { clienteId },
      update: updateDto,
      create: {
        clienteId,
        ...updateDto,
      },
    });

    return preferencias;
  }

  async toggleTema(clienteId: string) {
    const preferenciasActuales = await this.getPreferencias(clienteId);

    return this.updatePreferencias(clienteId, {
      temaOscuro: !preferenciasActuales.temaOscuro,
    });
  }

  async updateNotificaciones(
    clienteId: string,
    notificaciones: {
      notificacionesPush?: boolean;
      notificacionesEmail?: boolean;
      notificarEstadoPedidos?: boolean;
      notificarPromociones?: boolean;
    },
  ) {
    return this.updatePreferencias(clienteId, notificaciones);
  }

  async updatePrivacidad(
    clienteId: string,
    privacidad: {
      compartirUbicacion?: boolean;
      historialComprasVisible?: boolean;
    },
  ) {
    return this.updatePreferencias(clienteId, privacidad);
  }
}
