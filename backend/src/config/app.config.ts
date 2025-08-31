// Configuracion de la aplicacion con JWT token y base de datos
export const appConfig = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'tu-super-secreto-jwt-aqui-cambiar-en-produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'vitrina-app',
    audience: process.env.JWT_AUDIENCE || 'vitrina-users',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/vitrina?schema=public',
  },
};
