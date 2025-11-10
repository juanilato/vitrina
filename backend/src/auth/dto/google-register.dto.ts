// src/auth/dto/google-register.dto.ts
import { IsIn, IsString, MinLength } from 'class-validator';


// Google Register Dto verifica tipo(empresa, cliente, repartidor) de cuenta e idToken (string, min = 10)
export class GoogleRegisterDto {
  @IsString()
  @MinLength(10)
  idToken!: string;

  @IsIn(['cliente', 'empresa'])
  type!: 'cliente' | 'empresa';
}
