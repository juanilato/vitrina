# VITRINA - Plataforma de Vitrinas Digitales

Sistema fullstack completo para la plataforma VITRINA, que permite a las empresas crear vitrinas digitales y a los clientes explorarlas.

## 🎨 Diseño inspirado en VITRINA

Este proyecto utiliza la identidad visual oficial de VITRINA, incluyendo:
- **Colores de marca**: Teal (#14b8a6), Verde (#059669), Naranja (#f97316), Azul marino (#1e3a8a)
- **Logo personalizado**: Recreado en CSS basado en el diseño oficial
- **Tipografía**: Inter para una experiencia moderna y legible

## 🏗️ Arquitectura del Proyecto

```
vitrina-fullstack/
├── backend/           # API NestJS con Prisma
├── frontend/          # Aplicación React con TypeScript
└── package.json       # Scripts de gestión del proyecto
```

## 🚀 Tecnologías Utilizadas

### Backend
- **NestJS**: Framework Node.js para APIs
- **Prisma**: ORM moderno con PostgreSQL
- **bcryptjs**: Encriptación de contraseñas
- **TypeScript**: Tipado estático

### Frontend
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **React Router**: Navegación SPA
- **Axios**: Cliente HTTP
- **CSS Variables**: Sistema de diseño consistente

## 📋 Prerrequisitos

- Node.js 18+ 
- PostgreSQL
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd vitrina-fullstack
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar base de datos
```bash
cd backend
# Crear archivo .env con DATABASE_URL
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 4. Ejecutar migraciones
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Iniciar desarrollo
```bash
# En la raíz del proyecto
npm run dev
```

Esto iniciará:
- Backend en http://localhost:3001
- Frontend en http://localhost:3000

## 🔧 Scripts Disponibles

### Scripts principales (raíz)
- `npm run dev`: Inicia ambos servidores (backend + frontend)
- `npm run install:all`: Instala dependencias de ambos proyectos
- `npm run build`: Construye ambos proyectos para producción

### Backend
- `npm run dev:backend`: Inicia servidor de desarrollo
- `npm run start:backend`: Inicia servidor de producción

### Frontend
- `npm run dev:frontend`: Inicia servidor de desarrollo
- `npm run build:frontend`: Construye para producción

## 🌐 Endpoints de la API

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register-cliente` - Registrar cliente
- `POST /auth/register-empresa` - Registrar empresa

### Estructura de datos
- **Cliente**: email, name, password
- **Empresa**: email, name, password, logo
- **Productos**: nombre, descripción, precio, empresaId

## 🎯 Funcionalidades

### Sistema de Autenticación
- Login/Logout para empresas y clientes
- Registro con validación
- Rutas protegidas
- Gestión de sesiones

### Dashboard Personalizado
- **Empresas**: Gestión de perfil, productos y vitrina
- **Clientes**: Exploración de vitrinas disponibles

### Diseño Responsive
- Optimizado para móviles y desktop
- Componentes reutilizables
- Sistema de diseño consistente

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Validación de datos con class-validator
- Manejo de errores centralizado
- Autenticación basada en tokens

## 📱 Características del Frontend

- **Componentes modulares**: Login, Register, Dashboard
- **Context API**: Gestión de estado de autenticación
- **Routing**: Navegación SPA con React Router
- **Estilos CSS**: Variables CSS para consistencia de marca
- **Responsive**: Mobile-first design

## 🗄️ Base de Datos

### Modelos principales
- **Cliente**: Usuarios que exploran vitrinas
- **Empresa**: Empresas que crean vitrinas
- **Productos**: Catálogo de productos por empresa

### Relaciones
- Una empresa puede tener múltiples productos
- Los clientes pueden explorar todas las vitrinas

## 🚀 Despliegue

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Servir archivos estáticos desde dist/
```

## 🧪 Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📝 Notas de Desarrollo

- El frontend está configurado con proxy hacia el backend
- Las migraciones de Prisma se ejecutan automáticamente
- El sistema de login está completamente funcional
- Los estilos siguen la guía de marca de VITRINA

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

**VITRINA** - Transformando la forma en que las empresas muestran sus productos al mundo.
