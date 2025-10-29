import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VincularEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  codigoVinculo: string;
}

