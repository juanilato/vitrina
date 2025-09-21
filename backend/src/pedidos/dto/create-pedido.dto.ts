import { IsString, IsArray, IsNotEmpty, IsNumber, IsPositive, ValidateNested, IsIn, IsOptional } from 'class-validator';
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

  @IsString()
  @IsIn(['delivery', 'retiro'])
  tipoEntrega: string;

  @IsString()
  @IsIn(['transferencia', 'efectivo'])
  formaPago: string;

  @IsOptional()
  @IsString()
  transferenciaFoto?: string; // Base64 temporal
}
