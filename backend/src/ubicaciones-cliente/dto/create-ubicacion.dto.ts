import { IsString, IsNumber, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUbicacionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nombre: string; // "Casa", "Trabajo", etc.

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  direccion: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  referencia?: string; // Piso, depto, timbre, etc.

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsBoolean()
  esFavorita?: boolean;

  @IsString()
  clienteId!: string;
}
