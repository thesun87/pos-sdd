import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { PolicyLoaderInterceptor } from './policy-loader.interceptor.js';
import { of } from 'rxjs';

const mockPolicies = [
  {
    id: 'policy-1',
    tenant_id: 'tenant-abc',
    store_id: null,
    role: 'cashier',
    action: 'discount',
    resource: 'order',
    limit: 10,
    override_role: 'shift_lead',
    conditions: null,
    is_active: true,
  },
];

const mockDb = {
  policy: {
    findMany: vi.fn().mockResolvedValue(mockPolicies),
  },
};

const createMockContext = (user: unknown): { ctx: ExecutionContext; request: Record<string, unknown> } => {
  const request: Record<string, unknown> = { user };
  const ctx = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
  return { ctx, request };
};

const mockCallHandler: CallHandler = {
  handle: () => of(null),
};

describe('PolicyLoaderInterceptor', () => {
  let interceptor: PolicyLoaderInterceptor;

  beforeEach(() => {
    vi.clearAllMocks();
    interceptor = new PolicyLoaderInterceptor(mockDb as unknown as import('../../modules/database/database.service.js').DatabaseService);
  });

  it('load policies và gán vào request.policies', async () => {
    const user = { userId: 'u1', tenantId: 'tenant-abc', roles: ['cashier'], storeAssignments: [] };
    const { ctx, request } = createMockContext(user);

    await interceptor.intercept(ctx, mockCallHandler);

    expect(request['policies']).toEqual(mockPolicies);
    expect(mockDb.policy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenant_id: 'tenant-abc',
          role: { in: ['cashier'] },
          is_active: true,
        }),
      }),
    );
  });

  it('không query DB khi user không có roles', async () => {
    const user = { userId: 'u1', tenantId: 'tenant-abc', roles: [], storeAssignments: [] };
    const { ctx, request } = createMockContext(user);

    await interceptor.intercept(ctx, mockCallHandler);

    expect(request['policies']).toBeUndefined();
    expect(mockDb.policy.findMany).not.toHaveBeenCalled();
  });

  it('không query DB khi user là null', async () => {
    const { ctx, request } = createMockContext(null);

    await interceptor.intercept(ctx, mockCallHandler);

    expect(request['policies']).toBeUndefined();
    expect(mockDb.policy.findMany).not.toHaveBeenCalled();
  });
});
