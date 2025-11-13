import { Controller, Post, Body, UseGuards, Request, Get, Param, Put, Query, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterClienteDto, RegisterEmpresaDto, RegisterRepartidorDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/token.dto';
import { VerifyCodeDto, ResendCodeDto } from './dto/verification.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleLoginDto } from './dto/google-login.dto';
import { GoogleRegisterDto } from './dto/google-register.dto';
import { UpdateProfileDto, UpdatePasswordDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login de user 
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // login de user (google id token) - también crea usuario si no existe
  @Post('google')
  async loginWithGoogle(@Body() dto: GoogleLoginDto) {
    // Si el DTO tiene 'role', lo usamos como tipo solicitado
    const requestedType = dto.role as 'cliente' | 'empresa' | 'repartidor' | undefined;
    return await this.authService.loginWithGoogle(dto.idToken, requestedType);
  }

  // registro de cliente
  @Post('register/cliente')
  async registerCliente(@Body() registerClienteDto: RegisterClienteDto) {
    return this.authService.registerCliente(registerClienteDto);
  }

  // registro de una empresa
  @Post('register/empresa')
  async registerEmpresa(@Body() registerEmpresaDto: RegisterEmpresaDto) {
  
    return this.authService.registerEmpresa(registerEmpresaDto);
  }

    // registro de un repartidor
    @Post('register/repartidor')
    async registerRepartidor(@Body() registerRepartidorDto: RegisterRepartidorDto) {
    return this.authService.registerRepartidor(registerRepartidorDto);
    }

  // registro de google (id Token)
  @Post('google/register')
  async googleRegister(@Body() dto: GoogleRegisterDto) {
    return this.authService.registerWithGoogle(dto.idToken, dto.type);
  }
  
  // verificación de código
  @Post('verify')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
  }

  // reenvío de codigo
  @Post('resend-code')
  async resendVerificationCode(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.resendVerificationCode(resendCodeDto.email, resendCodeDto.userType);
  }

  // actualización de token
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  // cierre de sesión
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.id, req.user.type);
  }

  // obtención de perfil 
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      message: 'Perfil obtenido exitosamente',
      user: req.user
    };
  }

  // obtener empresas cercanas a una ubicación
  @UseGuards(JwtAuthGuard)
  @Get('companies/nearby')
  async getCompaniesByLocation(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    if (!lat || !lng) {
      throw new BadRequestException('Se requieren las coordenadas lat y lng');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Las coordenadas deben ser números válidos');
    }

    return this.authService.getCompaniesByLocation(latitude, longitude, radiusKm);
  }

  // obtener todas las empresas (para clientes)
  @UseGuards(JwtAuthGuard)
  @Get('companies')
  async getCompanies() {
    return this.authService.getCompanies();
  }

  // obtener empresa específica (para clientes)
  @UseGuards(JwtAuthGuard)
  @Get('companies/:id')
  async getCompany(@Param('id') id: string) {
    return this.authService.getCompany(id);
  }

  // obtener empresa específica con ubicaciones (para clientes)
  @UseGuards(JwtAuthGuard)
  @Get('companies/:id/locations')
  async getCompanyWithLocations(@Param('id') id: string) {
    return this.authService.getCompanyWithLocations(id);
  }

  // obtener empresa por nombre (público - sin guard)
  @Get('companies/by-name/:name')
  async getCompanyByName(@Param('name') name: string) {
    return this.authService.getCompanyByName(name);
  }

  // generar token de preview para live webpage (público - sin guard)
  @Get('companies/preview-token/:id')
  async generatePreviewToken(@Param('id') id: string) {
    return this.authService.generatePreviewToken(id);
  }

  // Actualizar perfil del cliente
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    // Solo permitir actualización de perfil para clientes
    if (req.user.type !== 'cliente') {
      return { message: 'Solo los clientes pueden actualizar su perfil desde este endpoint' };
    }
    return this.authService.updateClientProfile(req.user.id, updateProfileDto);
  }

  // Cambiar contraseña del cliente
  @UseGuards(JwtAuthGuard)
  @Put('password')
  async updatePassword(@Request() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    // Solo permitir cambio de contraseña para clientes
    if (req.user.type !== 'cliente') {
      return { message: 'Solo los clientes pueden cambiar su contraseña desde este endpoint' };
    }
    return this.authService.updateClientPassword(
      req.user.id,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword
    );
  }
}
