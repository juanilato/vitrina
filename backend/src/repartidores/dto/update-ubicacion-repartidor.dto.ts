import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateUbicacionRepartidorDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;
}
