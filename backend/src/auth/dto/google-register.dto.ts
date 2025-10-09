// src/auth/dto/google-register.dto.ts
import { IsIn, IsString, MinLength } from 'class-validator';

export class GoogleRegisterDto {
  @IsString()
  @MinLength(10)
  idToken!: string;

  @IsIn(['cliente', 'empresa'])
  type!: 'cliente' | 'empresa';
}
