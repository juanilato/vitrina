import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsHexColor,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DayOfWeek {
  LUN = 'LUN',
  MAR = 'MAR',
  MIE = 'MIE',
  JUE = 'JUE',
  VIE = 'VIE',
  SAB = 'SAB',
  DOM = 'DOM',
}

export class HorarioAtencionDto {
  @IsEnum(DayOfWeek)
  day!: DayOfWeek;

  @IsInt()
  @Min(0)
  slotIndex!: number;

  @IsInt()
  @Min(0)
  @Max(1440)
  abreMin!: number;

  @IsInt()
  @Min(0)
  @Max(1440)
  cierraMin!: number;

  @IsBoolean()
  cerrado!: boolean;
}

export class UpdatePreferenciasDto {
  /** Personalización UI */
  @IsString()
  empresaId!: string;
  
  @IsOptional()
  @IsHexColor()
  colorBotones?: string | null;

  @IsOptional()
  @IsHexColor()
  colorFondo?: string | null;

  /** Features */
  @IsBoolean()
  envioDomicilio!: boolean;

  @IsOptional()
  @IsString()
  dashboardFoto?: string | null; // URL (si querés, cambiá a IsUrl)

  /** Horarios normalizados */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HorarioAtencionDto)
  horarios!: HorarioAtencionDto[];
}
