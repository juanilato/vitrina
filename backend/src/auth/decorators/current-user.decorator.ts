import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorador para obtener el usuario actual
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
