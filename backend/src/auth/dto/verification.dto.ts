import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

// DTO para verificar el código de verificación
export class VerifyCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  userType: 'cliente' | 'empresa';
}

// DTO para reenviar el código de verificación
export class ResendCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  userType: 'cliente' | 'empresa';
}

// DTO para la respuesta de verificación
export class VerificationResponseDto {
  message: string;
  isVerified: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}
