import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdatePedidoDto {
  @IsOptional()
  @IsString()
  @IsIn(['pendiente_confirmacion', 'confirmado', 'en_proceso', 'esperando_delivery', 'en_camino', 'entregado', 'esperando_retiro', 'cancelado'])
  estado?: string;
}
