import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { StoreScopeGuard } from './store-scope.guard.js';

const createMockContext = (
  user: unknown,
  params: Record<string, string> = {},
  query: Record<string, unknown> = {},
  body: Record<string, unknown> = {},
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user, params, query, body }),
    }),
  }) as unknown as ExecutionContext;

describe('StoreScopeGuard', () => {
  let guard: StoreScopeGuard;

  beforeEach(() => {
    guard = new StoreScopeGuard();
  });

  it('cho qua khi request không có storeId (tenant-level operation)', () => {
    const user = { userId: 'u1', tenantId: 't1', roles: ['store_manager'], storeAssignments: [] };
    const ctx = createMockContext(user);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('cho qua khi user có ALL_STORES scope', () => {
    const user = {
      userId: 'u1', tenantId: 't1', roles: ['chain_owner'],
      storeAssignments: [{ storeId: 'store-1', scopeType: 'ALL_STORES' as const }],
    };
    const ctx = createMockContext(user, { storeId: 'store-999' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('cho qua khi user có SINGLE_STORE matching', () => {
    const user = {
      userId: 'u1', tenantId: 't1', roles: ['cashier'],
      storeAssignments: [{ storeId: 'store-1', scopeType: 'SINGLE_STORE' as const }],
    };
    const ctx = createMockContext(user, { storeId: 'store-1' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throw ForbiddenException khi SINGLE_STORE không match', () => {
    const user = {
      userId: 'u1', tenantId: 't1', roles: ['cashier'],
      storeAssignments: [{ storeId: 'store-1', scopeType: 'SINGLE_STORE' as const }],
    };
    const ctx = createMockContext(user, { storeId: 'store-999' });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('lấy storeId từ query params', () => {
    const user = {
      userId: 'u1', tenantId: 't1', roles: ['cashier'],
      storeAssignments: [{ storeId: 'store-1', scopeType: 'SINGLE_STORE' as const }],
    };
    const ctx = createMockContext(user, {}, { storeId: 'store-1' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lấy storeId từ body', () => {
    const user = {
      userId: 'u1', tenantId: 't1', roles: ['cashier'],
      storeAssignments: [{ storeId: 'store-1', scopeType: 'SINGLE_STORE' as const }],
    };
    const ctx = createMockContext(user, {}, {}, { storeId: 'store-1' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throw ForbiddenException khi user null', () => {
    const ctx = createMockContext(null, { storeId: 'store-1' });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
