import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateCategoriasDto {
  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subcategoriaIds?: string[];
}
