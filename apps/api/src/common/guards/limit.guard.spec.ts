import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LimitGuard } from './limit.guard.js';

const cashierDiscountPolicy = {
  id: 'policy-1',
  role: 'cashier',
  action: 'discount',
  resource: 'order',
  limit: 10,
  override_role: 'shift_lead',
  is_active: true,
};

const unlimitedPolicy = {
  ...cashierDiscountPolicy,
  limit: null,
};

const createMockContext = (
  user: unknown,
  policies: unknown[],
  body: Record<string, unknown> = {},
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user, policies, body }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

const mockUser = { userId: 'u1', tenantId: 't1', roles: ['cashier'], storeAssignments: [] };

describe('LimitGuard', () => {
  let guard: LimitGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() } as unknown as Reflector;
    guard = new LimitGuard(reflector);
  });

  it('cho qua khi không có @CheckPolicy() decorator', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);
    const ctx = createMockContext(mockUser, []);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('cho qua khi amount trong limit', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue({ action: 'discount', resource: 'order' });
    const ctx = createMockContext(mockUser, [cashierDiscountPolicy], { amount: 5 });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('cho qua khi amount bằng đúng limit', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue({ action: 'discount', resource: 'order' });
    const ctx = createMockContext(mockUser, [cashierDiscountPolicy], { amount: 10 });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throw ForbiddenException khi vượt limit, trả về needsApproval', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue({ action: 'discount', resource: 'order' });
    const ctx = createMockContext(mockUser, [cashierDiscountPolicy], { amount: 25 });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    try {
      guard.canActivate(ctx);
    } catch (e) {
      const err = e as ForbiddenException;
      const response = err.getResponse() as Record<string, unknown>;
      expect(response['needsApproval']).toBe(true);
      expect(response['currentLimit']).toBe(10);
      expect(response['requiredOverrideRole']).toBe('shift_lead');
    }
  });

  it('throw ForbiddenException (deny) khi không có matching policy', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue({ action: 'refund', resource: 'order' });
    const ctx = createMockContext(mockUser, [cashierDiscountPolicy], { amount: 5 });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    try {
      guard.canActivate(ctx);
    } catch (e) {
      const err = e as ForbiddenException;
      const response = err.getResponse() as Record<string, unknown>;
      expect(response['needsApproval']).toBe(false);
    }
  });

  it('cho qua khi limit = null (unlimited)', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue({ action: 'discount', resource: 'order' });
    const ctx = createMockContext(mockUser, [unlimitedPolicy], { amount: 99999 });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('cho qua khi không có amount/percentage trong body', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue({ action: 'discount', resource: 'order' });
    const ctx = createMockContext(mockUser, [cashierDiscountPolicy], {});

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
