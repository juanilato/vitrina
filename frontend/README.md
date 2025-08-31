# VITRINA Frontend

Frontend de React para la plataforma VITRINA, un sistema de vitrinas digitales para empresas.

## Características

- 🎨 **Diseño inspirado en VITRINA**: Utiliza los colores y elementos del brandbook oficial
- 🔐 **Sistema de autenticación completo**: Login y registro para empresas y clientes
- 📱 **Responsive design**: Optimizado para dispositivos móviles y desktop
- 🚀 **TypeScript**: Código tipado para mayor robustez
- 🎯 **Integración con backend**: Conectado con la API de NestJS existente

## Tecnologías utilizadas

- React 18
- TypeScript
- React Router DOM
- Axios para API calls
- CSS personalizado con variables CSS

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm start
```

3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── Login.tsx       # Página de inicio de sesión
│   ├── Register.tsx    # Página de registro
│   ├── Dashboard.tsx   # Dashboard principal
│   └── PrivateRoute.tsx # Ruta protegida
├── contexts/           # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── App.tsx            # Componente principal
├── index.tsx          # Punto de entrada
└── index.css          # Estilos globales
```

## Colores de marca VITRINA

- **Teal**: #14b8a6
- **Verde**: #059669  
- **Naranja**: #f97316
- **Azul marino**: #1e3a8a
- **Gris claro**: #f8fafc
- **Gris oscuro**: #0f172a

## Funcionalidades

### Autenticación
- Login con email y contraseña
- Registro de empresas y clientes
- Gestión de sesiones
- Rutas protegidas

### Dashboard
- Vista personalizada según tipo de usuario
- Gestión de perfil
- Panel de empresa (para empresas)
- Exploración de vitrinas (para clientes)

## Integración con Backend

El frontend está configurado para conectarse con el backend de NestJS en:
- **Desarrollo**: http://localhost:3001
- **Proxy configurado** en package.json para evitar problemas de CORS

## Scripts disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm build`: Construye la aplicación para producción
- `npm test`: Ejecuta las pruebas
- `npm eject`: Expone la configuración de webpack (irreversible)

## Desarrollo

### Agregar nuevas rutas
1. Crear el componente en `src/components/`
2. Agregar la ruta en `src/App.tsx`
3. Implementar la lógica de autenticación si es necesario

### Modificar estilos
- Los estilos globales están en `src/index.css`
- Los estilos específicos de componentes están en archivos CSS separados
- Utiliza las variables CSS definidas para mantener consistencia de marca

## Notas importantes

- El sistema de login actualmente simula la autenticación
- Para conectar con el backend real, modifica la función `login` en `AuthContext.tsx`
- Asegúrate de que el backend esté ejecutándose en el puerto 3001
