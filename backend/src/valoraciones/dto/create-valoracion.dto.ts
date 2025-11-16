import { IsString, IsInt, Min, Max, IsOptional, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enums que coinciden con Prisma
export enum AspectosEmpresa {
  EXCELENTE_CALIDAD = 'EXCELENTE_CALIDAD',
  BUENA_PRESENTACION = 'BUENA_PRESENTACION',
  PORCIONES_GENEROSAS = 'PORCIONES_GENEROSAS',
  RAPIDO = 'RAPIDO',
  BUENA_ATENCION = 'BUENA_ATENCION',
  BUENA_RELACION_PRECIO_CALIDAD = 'BUENA_RELACION_PRECIO_CALIDAD',
  MUY_RICO = 'MUY_RICO',
  FRESCO = 'FRESCO',
  BIEN_EMPAQUETADO = 'BIEN_EMPAQUETADO',
}

export enum AspectosRepartidor {
  PUNTUAL = 'PUNTUAL',
  AMABLE = 'AMABLE',
  CUIDADOSO = 'CUIDADOSO',
  BUENA_COMUNICACION = 'BUENA_COMUNICACION',
  PROFESIONAL = 'PROFESIONAL',
}

// DTO para valoración de un producto individual
export class ValoracionProductoDto {
  @IsString()
  productoId: string;

  @IsString()
  nombreProducto: string;

  @IsInt()
  @Min(1)
  @Max(5)
  calificacion: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}

// DTO principal para crear valoración
export class CreateValoracionDto {
  @IsString()
  pedidoId: string;

  // ——— Valoración de la Empresa ———
  @IsInt()
  @Min(1)
  @Max(5)
  calificacionEmpresa: number;

  @IsOptional()
  @IsString()
  comentarioEmpresa?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(AspectosEmpresa, { each: true })
  aspectosEmpresa?: AspectosEmpresa[];

  // ——— Valoración de Productos ———
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValoracionProductoDto)
  valoracionProductos?: ValoracionProductoDto[];

  // ——— Valoración del Repartidor (opcional) ———
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  calificacionRepartidor?: number;

  @IsOptional()
  @IsString()
  comentarioRepartidor?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(AspectosRepartidor, { each: true })
  aspectosRepartidor?: AspectosRepartidor[];
}
