import { SetMetadata } from '@nestjs/common';

// Decorador para definir los roles permitidos en una ruta
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
