import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmpresasService } from './empresas.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreatePrecioEnvioDto } from './dto/create-precio-envio.dto';
import { UpdatePrecioEnvioDto } from './dto/update-precio-envio.dto';
import { CalcularPrecioEnvioDto } from './dto/calcular-precio-envio.dto';
import { UpdatePreferenciasDto } from './dto/update-preferencias.dto';
import { UpdateExtrasDto } from './dto/update-extras.dto';
import { UpdateCategoriasDto } from './dto/update-categorias.dto';
@Controller('empresas')
@UseGuards(JwtAuthGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ) {
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.empresasService.changePassword(id, changePasswordDto);
  }

    @UseGuards(JwtAuthGuard)
  @Patch(':id/extras')
  async updateExtras(@Param('id') id: string, @Body() dto: UpdateExtrasDto, @Req() req: any) {
    console.log('📝 [UPDATE EXTRAS] Datos recibidos:', { empresaId: id, dto });
    const userId = req.user?.sub || req.user?.id; // ajustá al claim que uses
    const empresa = await this.empresasService.updateExtras(id, dto, userId);
    console.log('✅ [UPDATE EXTRAS] Empresa actualizada exitosamente');
    return empresa; // FE espera la empresa actualizada
  }


  @Post(':id/upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    console.log('📁 [UPLOAD LOGO] Iniciando subida de logo:', {
      empresaId: id,
      fileName: file?.originalname,
      fileSize: file?.size,
      fileMimetype: file?.mimetype,
      hasBuffer: !!file?.buffer
    });

    if (!file) {
      console.error('❌ [UPLOAD LOGO] No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    // Validar tipo de archivo
    if (!file.mimetype.startsWith('image/')) {
      console.error('❌ [UPLOAD LOGO] Invalid file type:', file.mimetype);
      throw new BadRequestException('Solo se permiten archivos de imagen');
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ [UPLOAD LOGO] File too large:', file.size);
      throw new BadRequestException('El archivo es demasiado grande. Máximo 5MB');
    }

    try {
      const result = await this.empresasService.uploadLogo(id, file);
      console.log('✅ [UPLOAD LOGO] Logo subido exitosamente:', result.logoUrl);
      return result;
    } catch (error) {
      console.error('❌ [UPLOAD LOGO] Error en servicio:', error);
      throw error;
    }
  }


   @Post(':id/upload-dashboard')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDashboard(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    console.log('📁 [UPLOAD dashboard] Iniciando subida de dashboard:', {
      empresaId: id,
      fileName: file?.originalname,
      fileSize: file?.size,
      fileMimetype: file?.mimetype,
      hasBuffer: !!file?.buffer
    });

    if (!file) {
      console.error('❌ [UPLOAD LOGO] No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    // Validar tipo de archivo
    if (!file.mimetype.startsWith('image/')) {
      console.error('❌ [UPLOAD LOGO] Invalid file type:', file.mimetype);
      throw new BadRequestException('Solo se permiten archivos de imagen');
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ [UPLOAD LOGO] File too large:', file.size);
      throw new BadRequestException('El archivo es demasiado grande. Máximo 5MB');
    }

    try {
      const result = await this.empresasService.uploadDashboard(id, file);
      console.log('✅ [UPLOAD LOGO] Logo subido exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ [UPLOAD LOGO] Error en servicio:', error);
      throw error;
    }
  }

  // Ubicaciones
  @Get(':id/ubicaciones')
  async getUbicaciones(@Param('id') id: string) {
    return this.empresasService.getUbicaciones(id);
  }

  @Post(':id/ubicaciones')
  async createUbicacion(
    @Param('id') id: string,
    @Body() createUbicacionDto: CreateUbicacionDto,
  ) {
    console.log('🏢 [CREATE UBICACION CONTROLLER] Recibiendo request:', {
      empresaId: id,
      data: createUbicacionDto
    });
    
    const result = await this.empresasService.createUbicacion(id, createUbicacionDto);
    
    console.log('🏢 [CREATE UBICACION CONTROLLER] Respuesta:', result);
    
    return result;
  }
  @Patch(':id/preferencias')
  async updatePreferencias(
    @Param('id') id: string,
    @Body() updatePreferenciasDto: UpdatePreferenciasDto,
  ) {
    return this.empresasService.updatePrefenencias(id, updatePreferenciasDto);
  }


  @Patch(':id/ubicaciones/:ubicacionId')
  async updateUbicacion(
    @Param('id') id: string,
    @Param('ubicacionId') ubicacionId: string,
    @Body() updateUbicacionDto: UpdateUbicacionDto,
  ) {
    return this.empresasService.updateUbicacion(id, ubicacionId, updateUbicacionDto);
  }

  @Delete(':id/ubicaciones/:ubicacionId')
  async removeUbicacion(
    @Param('id') id: string,
    @Param('ubicacionId') ubicacionId: string,
  ) {
    return this.empresasService.removeUbicacion(id, ubicacionId);
  }

  @Get(':id/logo')
  async getLogo(@Param('id') id: string, @Res() res: any) {
    try {
      const logoData = await this.empresasService.getLogoData(id);
      
      if (!logoData) {
        return res.status(404).json({ message: 'Logo no encontrado' });
      }

      // Configurar headers para la imagen
      res.set({
        'Content-Type': logoData.contentType,
        'Content-Length': logoData.size,
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        'Last-Modified': new Date().toUTCString(),
      });

      // Enviar la imagen
      return res.send(logoData.buffer);
    } catch (error) {
      console.error('Error obteniendo logo:', error);
      return res.status(500).json({ message: 'Error al obtener el logo' });
    }
  }
  @Get(':id/dashboard')
  async getDashboard(@Param('id') id: string, @Res() res: any) {
    try {
      const logoData = await this.empresasService.getDashboardData(id);
      
      if (!logoData) {
        return res.status(404).json({ message: 'Logo no encontrado' });
      }

      // Configurar headers para la imagen
      res.set({
        'Content-Type': logoData.contentType,
        'Content-Length': logoData.size,
        'Cache-Control': 'public, max-age=3600', 
        'Last-Modified': new Date().toUTCString(),
      });

      // Enviar la imagen
      return res.send(logoData.buffer);
    } catch (error) {
      console.error('Error obteniendo logo:', error);
      return res.status(500).json({ message: 'Error al obtener el logo' });
    }
  }


  // Precios de envío
  @Get(':id/ubicaciones/:ubicacionId/precios-envio')
  async getPreciosEnvio(
    @Param('id') id: string,
    @Param('ubicacionId') ubicacionId: string,
  ) {
    return this.empresasService.getPreciosEnvio(id, ubicacionId);
  }

  @Post(':id/ubicaciones/:ubicacionId/precios-envio')
  async createPrecioEnvio(
    @Param('id') id: string,
    @Param('ubicacionId') ubicacionId: string,
    @Body() createPrecioEnvioDto: CreatePrecioEnvioDto,
  ) {
    return this.empresasService.createPrecioEnvio(id, ubicacionId, createPrecioEnvioDto);
  }

  @Patch(':id/ubicaciones/:ubicacionId/precios-envio/:precioId')
  async updatePrecioEnvio(
    @Param('id') id: string,
    @Param('ubicacionId') ubicacionId: string,
    @Param('precioId') precioId: string,
    @Body() updatePrecioEnvioDto: UpdatePrecioEnvioDto,
  ) {
    return this.empresasService.updatePrecioEnvio(id, ubicacionId, precioId, updatePrecioEnvioDto);
  }

  @Delete(':id/ubicaciones/:ubicacionId/precios-envio/:precioId')
  async removePrecioEnvio(
    @Param('id') id: string,
    @Param('ubicacionId') ubicacionId: string,
    @Param('precioId') precioId: string,
  ) {
    return this.empresasService.removePrecioEnvio(id, ubicacionId, precioId);
  }

  @Post(':id/calcular-precio-envio')
  async calcularPrecioEnvio(
    @Param('id') id: string,
    @Body() calcularPrecioEnvioDto: CalcularPrecioEnvioDto,
  ) {
    return this.empresasService.calcularPrecioEnvio(id, calcularPrecioEnvioDto);
  }

  // Endpoint temporal para debug - verificar precios de envío
  @Get(':id/debug-precios-envio')
  async debugPreciosEnvio(@Param('id') id: string) {
    return this.empresasService.debugPreciosEnvio(id);
  }

  // Gestión de Repartidores
  @Post(':id/vincular-repartidor')
  async vincularRepartidor(
    @Param('id') id: string,
    @Body() body: { codigo: string },
  ) {
    return this.empresasService.vincularRepartidor(id, body.codigo);
  }

  @Get(':id/repartidores')
  async getRepartidores(@Param('id') id: string) {
    return this.empresasService.getRepartidores(id);
  }

  @Delete(':id/repartidor/:repartidorId')
  async eliminarVinculacion(
    @Param('id') id: string,
    @Param('repartidorId') repartidorId: string,
  ) {
    return this.empresasService.eliminarVinculacion(id, repartidorId);
  }

  // Categorías y Subcategorías
  @Patch(':id/categorias')
  async updateCategorias(
    @Param('id') id: string,
    @Body() updateCategoriasDto: UpdateCategoriasDto,
  ) {
    return this.empresasService.updateCategorias(id, updateCategoriasDto);
  }

  // Estadísticas
  @Get(':id/estadisticas')
  async getEstadisticas(@Param('id') id: string) {
    return this.empresasService.getEstadisticas(id);
  }
}
