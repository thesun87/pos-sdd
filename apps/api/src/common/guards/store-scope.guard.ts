import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { JwtPayload } from '../types/jwt-payload.js';

interface RequestWithUser {
  user?: JwtPayload;
  params: Record<string, string>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}

@Injectable()
export class StoreScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) throw new ForbiddenException('Unauthorized');

    // Lấy storeId từ params, query hoặc body
    const storeId =
      (request.params['storeId'] as string | undefined) ??
      (request.query['storeId'] as string | undefined) ??
      (request.body?.['storeId'] as string | undefined);

    // Nếu request không có storeId → tenant-level operation, cho qua
    if (!storeId) return true;

    const assignments = user.storeAssignments ?? [];

    for (const assignment of assignments) {
      if (assignment.scopeType === 'ALL_STORES') return true;

      if (assignment.scopeType === 'SINGLE_STORE' && assignment.storeId === storeId) return true;

      // STORE_GROUP: TODO(IG-2 — deferred) — cần query bảng store_group_members để kiểm tra
      // storeId có thuộc group không. Hiện tại simplified: chỉ match storeId trực tiếp.
      // Full implementation sẽ làm khi có Store Group management feature.
      if (assignment.scopeType === 'STORE_GROUP' && assignment.storeId === storeId) return true;
    }

    throw new ForbiddenException('Store access denied');
  }
}
