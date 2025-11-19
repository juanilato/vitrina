import { Module } from '@nestjs/common';
import { CategoriasProductoService } from './categorias-producto.service';
import { CategoriasProductoController } from './categorias-producto.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [CategoriasProductoService, PrismaService],
  controllers: [CategoriasProductoController]
})
export class CategoriasProductoModule {}
