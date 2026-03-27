import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../types/jwt-payload.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    if (!request.user) {
      throw new UnauthorizedException('User not found in request. Guard may have failed.');
    }
    return request.user;
  },
);
