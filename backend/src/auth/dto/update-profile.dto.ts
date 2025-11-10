import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

// Actualización de perfil (nombre e email)
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
// Update de contraseña, previa contraseña, contraseña futura. 
export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
