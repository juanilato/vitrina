import { IsNumber, IsNotEmpty } from 'class-validator';

export class CalcularPrecioEnvioDto {
  @IsNumber()
  @IsNotEmpty()
  clienteLat: number;

  @IsNumber()
  @IsNotEmpty()
  clienteLng: number;

  @IsNumber()
  @IsNotEmpty()
  ubicacionId: number;
}
