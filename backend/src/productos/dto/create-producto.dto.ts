import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductoDto {

    // dto for product creation 

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    descripcion?: string;

    
    @IsNotEmpty()
    @IsNumber()
    precio: number;

    @IsNotEmpty()
    @IsString()
    empresaId: string;

    @IsNotEmpty()
    @IsBoolean()
    activo: boolean;

    @IsString()
    @IsOptional()
    fotoUrl?: string;

    @IsString()
    @IsOptional()
    fotoPath?: string;
}

