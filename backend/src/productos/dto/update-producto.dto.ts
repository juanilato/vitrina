import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';

// update product creation dto
export class UpdateProductoDto extends PartialType(CreateProductoDto) {}
