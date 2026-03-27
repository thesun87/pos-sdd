import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/jwt-payload.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const token = this._extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    const secret = process.env['AUTH_JWT_SECRET'];
    if (!secret) throw new Error('AUTH_JWT_SECRET is not set');

    try {
      const payload = jwt.verify(token, secret) as JwtPayload;
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  private _extractToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.slice(7);
  }
}
