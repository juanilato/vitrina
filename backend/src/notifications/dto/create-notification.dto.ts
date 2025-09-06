import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  userType: string;

  @IsString()
  titulo: string;

  @IsString()
  mensaje: string;

  @IsString()
  tipo: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
