// configuración de token JWT
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'tu-super-secreto-jwt-aqui-cambiar-en-produccion',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'vitrina-app',
  audience: process.env.JWT_AUDIENCE || 'vitrina-users',
};
