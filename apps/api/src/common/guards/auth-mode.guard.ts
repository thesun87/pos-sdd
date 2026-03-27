import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { UserRole, Role, UserStoreAssignment } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/jwt-payload.js';
import { AuthService, SESSION_COOKIE_NAME } from '../../modules/auth/auth.service.js';

/**
 * Composite guard: kiểm tra session cookie (CustomSessionAuth) trước,
 * fallback sang JWT Bearer token.
 * Dùng cho các endpoints hỗ trợ cả Dashboard (session) và POS (JWT).
 */
@Injectable()
export class AuthModeGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();

    // 1. Kiểm tra session cookie
    const sessionToken = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (sessionToken) {
      const session = await this.authService.getSession(sessionToken);
      if (session) {
        request.user = {
          userId: session.user.id,
          tenantId: session.user.tenant_id,
          roles: session.user.user_roles.map((ur: UserRole & { role: Role }) => ur.role.name),
          storeAssignments: session.user.store_assignments.map((sa: UserStoreAssignment) => ({
            storeId: sa.store_id,
            scopeType: sa.scope_type as 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES',
          })),
        };
        return true;
      }
    }

    // 2. Fallback: kiểm tra JWT Bearer token
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
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

    throw new UnauthorizedException('Yêu cầu xác thực');
  }
}
