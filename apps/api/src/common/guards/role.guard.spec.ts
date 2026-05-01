import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard.js';

const createMockContext = (user: unknown, _roles?: string[]): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() } as unknown as Reflector;
    guard = new RoleGuard(reflector);
  });

  it('cho qua khi không có @Roles() decorator', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);
    const ctx = createMockContext({ roles: [] });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('cho qua khi roles rỗng (ROLES_KEY = [])', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue([]);
    const ctx = createMockContext({ roles: [] });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('cho qua khi user có ít nhất 1 role match', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['chain_owner', 'system_admin']);
    const ctx = createMockContext({ roles: ['store_manager', 'chain_owner'] });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throw ForbiddenException khi user không có role match', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['chain_owner', 'system_admin']);
    const ctx = createMockContext({ roles: ['cashier'] });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throw ForbiddenException khi user không có roles', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['chain_owner']);
    const ctx = createMockContext({ roles: [] });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throw ForbiddenException khi user là null', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(['chain_owner']);
    const ctx = createMockContext(null);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
