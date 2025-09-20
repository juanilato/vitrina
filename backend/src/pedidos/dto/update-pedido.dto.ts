import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdatePedidoDto {
  @IsOptional()
  @IsString()
  @IsIn(['pendiente_confirmacion', 'confirmado', 'en_proceso', 'listo', 'cancelado'])
  estado?: string;
}
