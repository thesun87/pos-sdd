import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthModeGuard } from './auth-mode.guard.js';
import * as jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
  verify: vi.fn(),
}));

const SECRET = 'test-secret-key-for-testing-min-32-chars';
const validPayload = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  roles: ['cashier'],
  storeAssignments: [],
  iat: 1000,
  exp: 9999999999,
};

const mockSessionData = {
  user: {
    id: 'user-1',
    tenant_id: 'tenant-1',
    email: 'test@example.com',
    name: 'Test',
    is_active: true,
    user_roles: [{ role: { name: 'cashier' } }],
    store_assignments: [],
  },
};

function makeContext(options: {
  cookieToken?: string;
  headers?: Record<string, string>;
}): ExecutionContext {
  const request: Record<string, unknown> = {
    headers: options.headers ?? {},
    cookies: options.cookieToken ? { session_token: options.cookieToken } : {},
    user: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthModeGuard', () => {
  let guard: AuthModeGuard;
  let mockAuthService: { getSession: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    process.env['AUTH_JWT_SECRET'] = SECRET;
    mockAuthService = { getSession: vi.fn() };
    guard = new AuthModeGuard(mockAuthService as never);
    vi.clearAllMocks();
  });

  it('should allow access when session cookie is valid', async () => {
    mockAuthService.getSession.mockResolvedValue(mockSessionData);

    const ctx = makeContext({ cookieToken: 'valid-session-token' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    const request = ctx.switchToHttp().getRequest() as Record<string, unknown>;
    expect((request.user as { userId: string }).userId).toBe('user-1');
  });

  it('should fallback to JWT when session cookie is absent', async () => {
    vi.mocked(jwt.verify).mockReturnValue(validPayload as unknown as jwt.JwtPayload);

    const ctx = makeContext({ headers: { authorization: 'Bearer valid-token' } });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should fallback to JWT when session is invalid', async () => {
    mockAuthService.getSession.mockResolvedValue(null);
    vi.mocked(jwt.verify).mockReturnValue(validPayload as unknown as jwt.JwtPayload);

    const ctx = makeContext({
      cookieToken: 'bad-session-token',
      headers: { authorization: 'Bearer valid-token' },
    });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no session and no JWT', async () => {
    mockAuthService.getSession.mockResolvedValue(null);

    const ctx = makeContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when no session and invalid JWT', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid');
    });

    const ctx = makeContext({ headers: { authorization: 'Bearer bad-token' } });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
