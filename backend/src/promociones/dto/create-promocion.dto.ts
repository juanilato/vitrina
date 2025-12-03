import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsObject } from "class-validator";
import { TipoPromocion, AlcancePromocion } from '@prisma/client';

export class CreatePromocionDto {
    @IsString()
    @IsNotEmpty()
    empresaId: string;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsEnum(TipoPromocion)
    @IsNotEmpty()
    tipo: TipoPromocion;

    @IsObject()
    @IsNotEmpty()
    configuracion: any; // { cantidadCompra, porcentajeDescuento, diasAplicables, cantidadPaga, cantidadLleva }

    @IsEnum(AlcancePromocion)
    @IsOptional()
    alcance?: AlcancePromocion = AlcancePromocion.TODOS;

    @IsBoolean()
    @IsOptional()
    activo?: boolean = true;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    productosIds?: string[];
}
