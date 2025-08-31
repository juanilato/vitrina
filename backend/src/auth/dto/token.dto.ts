import { IsString, IsNotEmpty } from 'class-validator';

// DTO para la respuesta de token
export class TokenResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsString()
  @IsNotEmpty()
  tokenType: string;

  @IsNotEmpty()
  expiresIn: number;

  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}

// DTO para el refresh token
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// DTO para el payload del token
export class TokenPayloadDto {
  sub: string;
  email: string;
  type: string;
  iat: number;
  exp?: number;
  iss?: string;
  aud?: string;
}
