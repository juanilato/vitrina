import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateUbicacionRepartidorDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  lng: number;
}
