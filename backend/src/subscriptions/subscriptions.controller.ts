import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ============ PLANES DE SUSCRIPCIÓN (Públicos) ============

  @Get('plans')
  async getAllPlanes() {
    return this.subscriptionsService.getAllPlanes();
  }

  @Get('plans/:id')
  async getPlanById(@Param('id') id: string) {
    return this.subscriptionsService.getPlanById(id);
  }

  // ============ SUSCRIPCIONES (Requieren autenticación) ============

  @UseGuards(JwtAuthGuard)
  @Get('empresa/:empresaId')
  async getSuscripcionByEmpresa(@Param('empresaId') empresaId: string) {
    return this.subscriptionsService.getSuscripcionByEmpresa(empresaId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSuscripcion(
    @Body()
    body: {
      empresaId: string;
      planId: string;
      metodoPagoId?: string;
    },
  ) {
    return this.subscriptionsService.createSuscripcion(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelSuscripcion(@Param('id') id: string) {
    return this.subscriptionsService.cancelSuscripcion(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/payment-method')
  async updateMetodoPago(
    @Param('id') id: string,
    @Body('metodoPagoId') metodoPagoId: string,
  ) {
    return this.subscriptionsService.updateMetodoPago(id, metodoPagoId);
  }

  // ============ HISTORIAL DE PAGOS ============

  @UseGuards(JwtAuthGuard)
  @Get('payments/empresa/:empresaId')
  async getPagosByEmpresa(@Param('empresaId') empresaId: string) {
    return this.subscriptionsService.getPagosByEmpresa(empresaId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('payments/:id')
  async getPagoById(@Param('id') id: string) {
    return this.subscriptionsService.getPagoById(id);
  }
}
