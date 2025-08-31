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
  @IsString()
  @IsNotEmpty()
  clienteId: string;

  @IsString()
  @IsNotEmpty()
  empresaId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemPedidoDto)
  items: CreateItemPedidoDto[];
}
