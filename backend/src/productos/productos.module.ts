import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { PrismaService } from 'prisma/prisma.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, PrismaService, SupabaseService],
})
export class ProductosModule {}
