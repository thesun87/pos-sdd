import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import type { JwtPayload } from '../types/jwt-payload.js';
import { DatabaseService } from '../../modules/database/database.service.js';

interface PolicyRecord {
  id: string;
  tenant_id: string;
  store_id: string | null;
  role: string;
  action: string;
  resource: string;
  limit: unknown;
  override_role: string | null;
  conditions: unknown;
  is_active: boolean;
}

// In-memory cache with TTL (5 phút)
const policyCache = new Map<string, { policies: PolicyRecord[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Xóa cache cho một tenant khi policies thay đổi */
export function invalidatePolicyCache(tenantId: string): void {
  for (const key of policyCache.keys()) {
    if (key.startsWith(`${tenantId}-`)) {
      policyCache.delete(key);
    }
  }
}

/** Evict các entries đã expired để tránh memory leak */
function evictExpiredCacheEntries(): void {
  const now = Date.now();
  for (const [key, value] of policyCache.entries()) {
    if (value.expiresAt <= now) {
      policyCache.delete(key);
    }
  }
}

@Injectable()
export class PolicyLoaderInterceptor implements NestInterceptor {
  constructor(private readonly db: DatabaseService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload; policies?: PolicyRecord[] }>();
    const user = request.user;

    if (user && user.tenantId && user.roles && user.roles.length > 0) {
      const cacheKey = `${user.tenantId}-${[...user.roles].sort().join(',')}`;
      const cached = policyCache.get(cacheKey);

      if (cached && cached.expiresAt > Date.now()) {
        request.policies = cached.policies;
      } else {
        const policies = await this.db.policy.findMany({
          where: {
            tenant_id: user.tenantId,
            role: { in: user.roles },
            is_active: true,
          },
        });
        evictExpiredCacheEntries();
        policyCache.set(cacheKey, { policies, expiresAt: Date.now() + CACHE_TTL_MS });
        request.policies = policies;
      }
    }

    return next.handle();
  }
}
