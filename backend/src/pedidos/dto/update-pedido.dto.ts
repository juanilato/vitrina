import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdatePedidoDto {
  @IsOptional()
  @IsString()
  @IsIn(['pendiente', 'en_proceso', 'finalizado', 'cancelado'])
  estado?: string;
}
