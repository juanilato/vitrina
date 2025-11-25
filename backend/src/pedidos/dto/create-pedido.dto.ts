import { IsString, IsArray, IsNotEmpty, IsNumber, IsPositive, ValidateNested, IsIn, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para ingredientes extras en el item
export class IngredienteExtraDto {
  @IsNumber()
  @IsPositive()
  productoIngredienteId: number;

  @IsNumber()
  @IsPositive()
  cantidad: number;
}

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

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredienteExtraDto)
  ingredientesExtras?: IngredienteExtraDto[];
}

export class UbicacionPedidoDto {
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
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
  @Type(() => UbicacionPedidoDto)
  ubicacion?: UbicacionPedidoDto; // Ubicación de entrega si es delivery

  // Campos para pedidos locales
  @IsOptional()
  @IsString()
  @IsIn(['app', 'local'])
  origenPedido?: string; // 'app' (default) o 'local'

  @IsOptional()
  @IsString()
  nombreClienteLocal?: string; // Nombre del cliente walk-in (para pedidos locales)

  @IsOptional()
  @IsString()
  mesaNumero?: string; // Número de mesa (para pedidos locales)
}
