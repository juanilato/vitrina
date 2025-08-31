import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO para el login de usuarios
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
