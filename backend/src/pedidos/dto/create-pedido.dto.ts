import { IsString, IsArray, IsNotEmpty, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// creación de pedido 
export class CreateItemPedidoDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsNumber()
  @IsPositive()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  precio: number;
}

export class CreatePedidoDto {
  clienteId?: string; // Opcional, se asignará en el controller

  @IsString()
  @IsNotEmpty()
  empresaId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemPedidoDto)
  items: CreateItemPedidoDto[];
}
