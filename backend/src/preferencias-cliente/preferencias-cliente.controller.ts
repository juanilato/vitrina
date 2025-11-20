import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PreferenciasClienteService } from './preferencias-cliente.service';
import { UpdatePreferenciasDto } from './dto/update-preferencias.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('preferencias-cliente')
@UseGuards(JwtAuthGuard)
export class PreferenciasClienteController {
  constructor(
    private readonly preferenciasService: PreferenciasClienteService,
  ) {}

  @Get()
  async getPreferencias(@Request() req) {
    return this.preferenciasService.getPreferencias(req.user.id);
  }

  @Put()
  async updatePreferencias(
    @Request() req,
    @Body() updateDto: UpdatePreferenciasDto,
  ) {
    return this.preferenciasService.updatePreferencias(req.user.id, updateDto);
  }

  @Patch('tema')
  async toggleTema(@Request() req) {
    return this.preferenciasService.toggleTema(req.user.id);
  }

  @Patch('notificaciones')
  async updateNotificaciones(
    @Request() req,
    @Body()
    notificaciones: {
      notificacionesPush?: boolean;
      notificacionesEmail?: boolean;
      notificarEstadoPedidos?: boolean;
      notificarPromociones?: boolean;
    },
  ) {
    return this.preferenciasService.updateNotificaciones(
      req.user.id,
      notificaciones,
    );
  }

  @Patch('privacidad')
  async updatePrivacidad(
    @Request() req,
    @Body()
    privacidad: {
      compartirUbicacion?: boolean;
      historialComprasVisible?: boolean;
    },
  ) {
    return this.preferenciasService.updatePrivacidad(req.user.id, privacidad);
  }
}
