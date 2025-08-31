import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

// DTO para el registro de un cliente
export class RegisterClienteDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  type?: string;
}

// DTO para el registro de una empresa
export class RegisterEmpresaDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
