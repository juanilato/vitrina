// src/ingrediente/ingrediente.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; 
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { IngredienteStats } from './dto/ingrediente-stats.interface';

@Injectable()
export class IngredienteService {
  // Inyectamos el servicio de Prisma para usar el cliente
  constructor(private prisma: PrismaService) {}

  // POST /ingrediente
  create(createIngredienteDto: CreateIngredienteDto) {
    return this.prisma.ingrediente.create({
      data: createIngredienteDto,
    });
  }

  // GET /ingrediente
  findAll(empresaId: string) {
    // Filtramos por la empresa para asegurar la seguridad
    return this.prisma.ingrediente.findMany({
      where: { empresaId },
    });
  }

  // GET /ingrediente/:id
  findOne(id: string) {
    return this.prisma.ingrediente.findUnique({
      where: { id },
    });
  }

  // PATCH /ingrediente/:id
  update(id: string, updateIngredienteDto: UpdateIngredienteDto) {
    return this.prisma.ingrediente.update({
      where: { id },
      data: updateIngredienteDto,
    });
  }

  // DELETE /ingrediente/:id
  remove(id: string) {
    return this.prisma.ingrediente.delete({
      where: { id },
    });
  }

   async getIngredientesStats(empresaId: string): Promise<IngredienteStats> {
    
    // 1. Contar el total de tipos de ingredientes únicos
    const totalTipos = await this.prisma.ingrediente.count({
      where: { empresaId },
    });

    // 2. Sumar el stock disponible de todos los ingredientes de la empresa
    const stockResult = await this.prisma.ingrediente.aggregate({
      _sum: {
        stockDisponible: true,
      },
      where: { empresaId },
    });

    const totalUnidades = stockResult._sum.stockDisponible || 0;
    
    // 3. Devolver el objeto de estadísticas
    return {
      total: totalTipos,
      tiposUnicos: totalTipos, // Es el mismo valor en este contexto
      unidades: totalUnidades,
    };
  }
}