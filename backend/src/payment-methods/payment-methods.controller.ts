import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TipoMetodoPago } from '@prisma/client';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get('empresa/:empresaId')
  async getMetodosPagoByEmpresa(@Param('empresaId') empresaId: string) {
    return this.paymentMethodsService.getMetodosPagoByEmpresa(empresaId);
  }

  @Get(':id')
  async getMetodoPagoById(@Param('id') id: string) {
    return this.paymentMethodsService.getMetodoPagoById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMetodoPago(
    @Body()
    body: {
      empresaId: string;
      tipo: TipoMetodoPago;
      ultimos4?: string;
      marca?: string;
      expiraMes?: number;
      expiraAnio?: number;
      tokenProcesador?: string;
      procesador?: string;
      esPredeterminado?: boolean;
    },
  ) {
    return this.paymentMethodsService.createMetodoPago(body);
  }

  @Patch(':id/set-default')
  async setMetodoPagoPredeterminado(
    @Param('id') id: string,
    @Body('empresaId') empresaId: string,
  ) {
    return this.paymentMethodsService.setMetodoPagoPredeterminado(id, empresaId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMetodoPago(
    @Param('id') id: string,
    @Body('empresaId') empresaId: string,
  ) {
    await this.paymentMethodsService.deleteMetodoPago(id, empresaId);
  }
}
