import { PartialType } from '@nestjs/mapped-types';
import { CreatePrecioEnvioDto } from './create-precio-envio.dto';

export class UpdatePrecioEnvioDto extends PartialType(CreatePrecioEnvioDto) {}
