// src/ingrediente/dto/create-ingrediente.dto.ts
import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateIngredienteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @IsNotEmpty()
  stockDisponible: number;

  @IsString()
  @IsNotEmpty()
  unidadMedida: string;
  
  // Campo que añadiste para el ícono
  @IsString()
  @IsOptional()
  icono?: string; 
  
  // Asumiendo que el ID de la empresa es obligatorio al crear
  @IsString()
  @IsNotEmpty()
  empresaId: string;
}