import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

// DTO para actualizar la autenticación
export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
