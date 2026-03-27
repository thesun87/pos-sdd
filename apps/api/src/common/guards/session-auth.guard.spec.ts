import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { SessionAuthGuard } from './session-auth.guard.js';

const mockSession = {
  user: {
    id: 'user-id-123',
    tenant_id: 'tenant-id-abc',
    email: 'test@example.com',
    name: 'Test User',
    is_active: true,
    user_roles: [{ role: { name: 'cashier' } }],
    store_assignments: [{ store_id: 'store-id-1', scope_type: 'SINGLE_STORE' }],
  },
};

function makeContext(cookieToken?: string) {
  const mockRequest = {
    cookies: cookieToken ? { session_token: cookieToken } : {},
    user: undefined as unknown,
  };
  const mockResponse = {
    clearCookie: vi.fn(),
  };
  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
    request: mockRequest,
    response: mockResponse,
  };
}

describe('SessionAuthGuard', () => {
  let guard: SessionAuthGuard;
  let mockAuthService: { getSession: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = { getSession: vi.fn() };
    guard = new SessionAuthGuard(mockAuthService as never);
  });

  it('should pass and inject user for valid session cookie', async () => {
    mockAuthService.getSession.mockResolvedValue(mockSession);
    const ctx = makeContext('valid-token');

    const result = await guard.canActivate(ctx as never);

    expect(result).toBe(true);
    expect(ctx.request.user).toMatchObject({
      userId: 'user-id-123',
      tenantId: 'tenant-id-abc',
      roles: ['cashier'],
    });
  });

  it('should throw UnauthorizedException when no cookie', async () => {
    const ctx = makeContext();

    await expect(guard.canActivate(ctx as never)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException and clear cookie when session invalid/expired', async () => {
    mockAuthService.getSession.mockResolvedValue(null);
    const ctx = makeContext('expired-token');

    await expect(guard.canActivate(ctx as never)).rejects.toThrow(UnauthorizedException);
    expect(ctx.response.clearCookie).toHaveBeenCalled();
  });
});
