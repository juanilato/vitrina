import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Express } from 'express';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // crea producto
  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  // obtiene todos los productos de empresa propia
  @Get()
  findAll(@Query('empresaId') empresaId?: string) {
    if (empresaId) {
      return this.productosService.findAll(empresaId);
    }
    // Si no se proporciona empresaId, devolver array vacío o error
    return [];
  }

  // obtiene productos de una empresa específica (para clientes)
  @Get('empresa/:empresaId')
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.productosService.findByEmpresa(empresaId);
  }

  // obtiene un producto
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  // actualiza un producto
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(id, updateProductoDto);
  }

  // elimina un producto
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }

  // Endpoint para subir archivos de imágenes
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, 
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
      }
      callback(null, true);
    },
  }))
  async uploadImage(
    @UploadedFile() file: any,
    @Body('empresaId') empresaId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!empresaId) {
      throw new BadRequestException('empresaId es requerido');
    }

    return this.productosService.uploadImage(file, empresaId);
  }

  // Endpoint para actualizar producto con nueva imagen (borra la anterior automáticamente)
  @Patch(':id/update-with-image')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
      }
      callback(null, true);
    },
  }))
  async updateWithImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body() updateData: any,
  ) {
    return this.productosService.updateWithImage(id, file, updateData);
  }

  // Endpoint para crear producto con imagen
  @Post('create-with-image')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
      }
      callback(null, true);
    },
  }))
  async createWithImage(
    @UploadedFile() file: any,
    @Body() createData: any,
  ) {
    return this.productosService.createWithImage(file, createData);
  }

  // Endpoint para obtener estadísticas de productos
  @Get('stats/:empresaId')
  getStats(@Param('empresaId') empresaId: string) {
    return this.productosService.getStats(empresaId);
  }
}
