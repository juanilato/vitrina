import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TempPhotoService {
  private readonly tempDir = path.join(process.cwd(), 'temp-photos');
  private readonly photoExpirationTime = 24 * 60 * 60 * 1000; // 24 horas en ms

  constructor() {
    // Crear directorio temporal si no existe
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Guarda una foto temporalmente y retorna el nombre del archivo
   */
  async saveTempPhoto(pedidoId: string, base64Photo: string): Promise<string> {
    try {

      // Extraer el tipo de imagen del Base64
      const matches = base64Photo.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Formato de imagen Base64 inválido');
      }

      const imageType = matches[1];
      const base64Data = matches[2];


      // Validar tipo de imagen
      if (!['jpeg', 'jpg', 'png'].includes(imageType.toLowerCase())) {
        throw new Error('Solo se permiten imágenes JPG y PNG');
      }

      // Crear nombre único para el archivo
      const fileName = `transferencia_${pedidoId}_${Date.now()}.${imageType}`;
      const filePath = path.join(this.tempDir, fileName);


      // Convertir Base64 a buffer y guardar
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);


      // Programar eliminación automática después de 24 horas
      setTimeout(() => {
        this.deleteTempPhoto(fileName);
      }, this.photoExpirationTime);

      return fileName;
    } catch (error) {
      console.error('Error guardando foto temporal:', error);
      throw new Error('Error al guardar la foto temporal');
    }
  }

  /**
   * Obtiene la ruta completa de una foto temporal
   */
  getTempPhotoPath(fileName: string): string {
    return path.join(this.tempDir, fileName);
  }

  /**
   * Verifica si una foto temporal existe
   */
  tempPhotoExists(fileName: string): boolean {
    const filePath = this.getTempPhotoPath(fileName);
    return fs.existsSync(filePath);
  }

  /**
   * Elimina una foto temporal
   */
  deleteTempPhoto(fileName: string): boolean {
    try {
      const filePath = this.getTempPhotoPath(fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Foto temporal eliminada: ${fileName}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error eliminando foto temporal:', error);
      return false;
    }
  }

  /**
   * Obtiene el contenido de una foto temporal como Base64
   */
  getTempPhotoAsBase64(fileName: string): string | null {
    try {
      const filePath = this.getTempPhotoPath(fileName);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      
      // Determinar el tipo MIME basado en la extensión
      const ext = path.extname(fileName).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
      
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error leyendo foto temporal:', error);
      return null;
    }
  }

  /**
   * Limpia todas las fotos temporales expiradas
   */
  async cleanupExpiredPhotos(): Promise<void> {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();

        if (fileAge > this.photoExpirationTime) {
          fs.unlinkSync(filePath);
          console.log(`Foto expirada eliminada: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error limpiando fotos expiradas:', error);
    }
  }
}
