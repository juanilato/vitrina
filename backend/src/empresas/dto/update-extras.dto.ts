import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SocialLinkDto {
  @IsString() key!: string;
  @IsString() label!: string;
  @IsString() value!: string;
}

export class UpdateExtrasDto {
  // Alias único (puede venir vacío para borrar)
  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional() // <-- Hacer opcional el array también
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  redesSociales?: SocialLinkDto[]; // <-- Añadir ? para que sea opcional
}
