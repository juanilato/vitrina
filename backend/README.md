<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Backend Vitrina - Sistema de Autenticación JWT

## Características del Sistema JWT

### 🔐 **Access Token**
- **Duración**: 15 minutos
- **Formato**: JWT (JSON Web Token)
- **Algoritmo**: HS256
- **Contenido**: ID de usuario, email, tipo de usuario, timestamps

### 🔄 **Refresh Token**
- **Duración**: 7 días
- **Propósito**: Renovar access tokens expirados
- **Seguridad**: Verificación criptográfica

## 🚀 **Endpoints Disponibles**

### **Autenticación Pública**
```http
POST /auth/login
POST /auth/register/cliente
POST /auth/register/empresa
POST /auth/refresh
```

### **Rutas Protegidas (Requieren JWT)**
```http
POST /auth/logout
GET  /auth/profile
```

## 📝 **Uso del Sistema**

### **1. Login**
```json
POST /auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "user-id",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "type": "cliente"
  }
}
```

### **2. Usar Access Token**
```http
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **3. Renovar Token**
```json
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🛡️ **Seguridad**

### **Headers Requeridos**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### **Validaciones**
- Verificación de firma JWT
- Expiración automática
- Validación de usuario en base de datos
- Control de acceso por tipo de usuario

## ⚙️ **Configuración**

### **Variables de Entorno**
```bash
JWT_SECRET=tu-super-secreto-jwt-aqui-cambiar-en-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=vitrina-app
JWT_AUDIENCE=vitrina-users
```

### **Personalización**
- Cambiar `JWT_SECRET` en producción
- Ajustar tiempos de expiración según necesidades
- Configurar issuer y audience para tu aplicación

## 🔧 **Implementación Técnica**

### **Dependencias**
- `@nestjs/jwt`: Generación y verificación de JWT
- `@nestjs/passport`: Estrategias de autenticación
- `passport-jwt`: Estrategia JWT para Passport
- `bcryptjs`: Encriptación de contraseñas

### **Estructura de Archivos**
```
src/auth/
├── auth.controller.ts      # Controlador principal
├── auth.service.ts         # Lógica de negocio
├── auth.module.ts          # Módulo de autenticación
├── jwt.strategy.ts         # Estrategia JWT
├── jwt-auth.guard.ts       # Guard de autenticación
├── guards/
│   └── roles.guard.ts      # Guard de roles
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── dto/
    ├── login.dto.ts
    ├── register.dto.ts
    └── token.dto.ts
```

## 🚨 **Mejores Prácticas**

1. **Nunca almacenes JWT_SECRET en el código**
2. **Usa HTTPS en producción**
3. **Implementa rate limiting para endpoints de auth**
4. **Considera usar refresh token rotation**
5. **Monitorea tokens expirados y revocados**

## 🧪 **Testing**

### **Con Thunder Client**
1. Hacer login para obtener tokens
2. Usar access token en header Authorization
3. Probar endpoints protegidos
4. Renovar token cuando expire

### **Ejemplo de Test**
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@ejemplo.com",
  "password": "password123"
}
```

---

**¡Sistema JWT completamente implementado y listo para usar!** 🎉
