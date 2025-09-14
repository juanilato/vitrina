import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateUbicacionDto {
  @IsString()
  direccion: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
