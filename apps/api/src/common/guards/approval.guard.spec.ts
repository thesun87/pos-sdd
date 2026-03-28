import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ApprovalGuard } from './approval.guard.js';

const mockAuditLog = { create: vi.fn() };
const mockDb = { auditLog: mockAuditLog };

const createMockContext = (
  user: unknown,
  needsApproval: boolean,
  headers: Record<string, string> = {},
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user, needsApproval, headers }),
    }),
  }) as unknown as ExecutionContext;

const mockUser = { userId: 'u1', tenantId: 't1', roles: ['cashier'], storeAssignments: [] };

describe('ApprovalGuard', () => {
  let guard: ApprovalGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new ApprovalGuard(mockDb as unknown as import('../../modules/database/database.service.js').DatabaseService);
  });

  it('cho qua khi action không cần approval', async () => {
    const ctx = createMockContext(mockUser, false);

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throw ForbiddenException khi cần approval nhưng không có token', async () => {
    const ctx = createMockContext(mockUser, true);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('throw ForbiddenException khi approval token không hợp lệ', async () => {
    process.env['AUTH_JWT_SECRET'] = 'test-secret';
    const ctx = createMockContext(mockUser, true, { 'x-approval-token': 'invalid.token.here' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
