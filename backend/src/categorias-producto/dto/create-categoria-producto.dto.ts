import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";
import { Transform } from 'class-transformer';

export class CreateCategoriaProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ValidateIf((o) => o.empresaId !== undefined)
  @IsString()
  @IsNotEmpty()
  empresaId?: string;

  @IsString()
  @IsOptional()
  icono?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value);
    }
    return value || 0;
  })
  orden?: number = 0;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value !== undefined ? value : true;
  })
  activo?: boolean = true;
}
