import { IsString, IsArray, IsNotEmpty, IsNumber, IsPositive, ValidateNested, IsIn, IsOptional, IsBoolean } from 'class-validator';
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

export class DeliveryLocationDto {
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class ShippingPriceDto {
  @IsOptional()
  @IsNumber()
  price: number | null;

  @IsBoolean()
  isEstimated: boolean;

  @IsString()
  message: string;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryLocationDto)
  deliveryLocation?: DeliveryLocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingPriceDto)
  shippingPrice?: ShippingPriceDto;
}
