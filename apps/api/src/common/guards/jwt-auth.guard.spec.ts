import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import * as jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
  verify: vi.fn(),
}));

const SECRET = 'test-secret-key-for-testing';

function makeContext(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers, user: undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    process.env['AUTH_JWT_SECRET'] = SECRET;
    guard = new JwtAuthGuard();
    vi.clearAllMocks();
  });

  it('should allow access with valid JWT token', () => {
    const payload = { userId: 'user-1', tenantId: 'tenant-1', roles: ['cashier'], storeAssignments: [], iat: 1000, exp: 9999999999 };
    vi.mocked(jwt.verify).mockReturnValue(payload as unknown as jwt.JwtPayload);

    const ctx = makeContext({ authorization: 'Bearer valid-token' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw UnauthorizedException when no Authorization header', () => {
    const ctx = makeContext({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is expired', () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new jwt.TokenExpiredError('jwt expired', new Date()); });

    const ctx = makeContext({ authorization: 'Bearer expired-token' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token has invalid signature', () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new jwt.JsonWebTokenError('invalid signature'); });

    const ctx = makeContext({ authorization: 'Bearer invalid-token' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when Authorization header is malformed', () => {
    const ctx = makeContext({ authorization: 'Basic some-basic-token' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
