import { IsBoolean, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdatePreferenciasDto {
  @IsOptional()
  @IsBoolean()
  temaOscuro?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacionesPush?: boolean;

  @IsOptional()
  @IsBoolean()
  notificacionesEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarEstadoPedidos?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarPromociones?: boolean;

  @IsOptional()
  @IsBoolean()
  compartirUbicacion?: boolean;

  @IsOptional()
  @IsBoolean()
  historialComprasVisible?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['es', 'en', 'pt'])
  idioma?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ARS', 'USD', 'EUR', 'BRL'])
  moneda?: string;
}
