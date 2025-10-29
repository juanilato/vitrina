import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateEstadoPedidoDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['esperando_delivery', 'en_camino', 'entregado'])
  estado: string;
}

