import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class UpdateEmpresaDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
