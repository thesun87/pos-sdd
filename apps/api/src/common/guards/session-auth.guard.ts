import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { UserRole, Role, UserStoreAssignment } from '@prisma/client';
import { AuthService, SESSION_COOKIE_NAME } from '../../modules/auth/auth.service.js';

/**
 * SessionAuthGuard: đọc session_token từ cookie, query sessions table,
 * inject user vào request.user nếu session hợp lệ.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const response = context.switchToHttp().getResponse<Response>();

    const token = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Yêu cầu xác thực');
    }

    const session = await this.authService.getSession(token);
    if (!session) {
      // Xóa cookie không hợp lệ
      response.clearCookie(SESSION_COOKIE_NAME);
      throw new UnauthorizedException('Session không hợp lệ hoặc đã hết hạn');
    }

    // Inject user data vào request (không bao gồm sessionToken để tránh leak)
    request.user = {
      userId: session.user.id,
      tenantId: session.user.tenant_id,
      roles: session.user.user_roles.map((ur: UserRole & { role: Role }) => ur.role.name),
      storeAssignments: session.user.store_assignments.map((sa: UserStoreAssignment) => ({
        storeId: sa.store_id,
        scopeType: sa.scope_type,
      })),
    };

    return true;
  }
}
