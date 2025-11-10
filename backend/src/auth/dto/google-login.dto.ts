import { IsString, MinLength } from 'class-validator';

// Google Login Dto, verifica id de tipo string y minima longitud = 10 
export class GoogleLoginDto {
  @IsString()
  @MinLength(10)
  idToken!: string;
}