import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterClienteDto, RegisterEmpresaDto, RegisterRepartidorDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/token.dto';
import { VerifyCodeDto, ResendCodeDto } from './dto/verification.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleLoginDto } from './dto/google-login.dto';
import { GoogleRegisterDto } from './dto/google-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login de user 
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  async loginWithGoogle(@Body() dto: GoogleLoginDto) {
    const { accessToken, user } = await this.authService.loginWithGoogle(dto.idToken);
    return { accessToken, user };
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

    // registro de una empresa
    @Post('register/repartidor')
    async registerRepartidor(@Body() registerRepartidorDto: RegisterRepartidorDto) {
    return this.authService.registerRepartidor(registerRepartidorDto);
    }

  
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

  // obtención de perfil (no usado)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      message: 'Perfil obtenido exitosamente',
      user: req.user
    };
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
}
