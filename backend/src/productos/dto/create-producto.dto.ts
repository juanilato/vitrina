import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsDecimal } from "class-validator";
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';
import { Transform } from 'class-transformer';

export class ProductoIngredienteDto {
    @IsString()
    @IsNotEmpty()
    ingredienteId: string;

    @IsNumber()
    @IsNotEmpty()
    cantidadRequerida: number;

    @IsBoolean()
    @IsOptional()
    esExtraPermitido?: boolean;
}

export class CreateProductoDto {
    // dto for product creation 
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
    
    @IsNotEmpty()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    })
    precio: number;

    @IsNotEmpty()
    @IsString()
    empresaId: string;

    @IsNotEmpty()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    activo: boolean;

    @IsString()
    @IsOptional()
    fotoUrl?: string;

    @IsString()
    @IsOptional()
    fotoPath?: string;

    @IsString()
    @IsOptional()
    @Transform(({ value }) => value || 'individual')
    tipoStock?: string = 'individual';

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return parseInt(value);
        }
        return value;
    })
    stockIndividual?: number;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value || false;
    })
    permiteExtras?: boolean = false;
    
    // No incluido en la creación directa de Prisma
    @IsOptional()
    @IsArray()
    @Type(() => ProductoIngredienteDto)
    ingredientes?: ProductoIngredienteDto[];

    // Categorías del producto (array de IDs)
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categoriaIds?: string[];
}

