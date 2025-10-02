import { IsNumber, Min } from 'class-validator';

export class CreatePrecioEnvioDto {
  @IsNumber()
  ubicacionId: number;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsNumber()
  @Min(0)
  distancia: number;
}
