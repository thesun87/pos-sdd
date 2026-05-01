import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';

// Mock @pos-sdd/shared
vi.mock('@pos-sdd/shared', () => ({
  generateId: () => 'test-uuid-123',
  hashPin: async (pin: string) => `hashed:${pin}`,
  verifyPin: async (pin: string, hash: string) => hash === `hashed:${pin}`,
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: async (_pw: string, _rounds: number) => 'hashed-password',
    compare: async (pw: string, hash: string) => hash === 'hashed-password' && pw === 'Password1',
  },
  hash: async (_pw: string, _rounds: number) => 'hashed-password',
  compare: async (pw: string, hash: string) => hash === 'hashed-password' && pw === 'Password1',
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn(() => 'mock-jwt-token') },
  sign: vi.fn(() => 'mock-jwt-token'),
}));

// Mock crypto
vi.mock('crypto', () => ({
  randomBytes: (_size: number) => ({ toString: (_enc: string) => 'random-session-token' }),
}));

const mockUserRow = {
  id: 'user-id-123',
  tenant_id: 'tenant-id-abc',
  email: 'test@example.com',
  name: 'Test User',
  pin_hash: 'hashed:1234',
  is_active: true,
  user_roles: [{ role: { name: 'cashier' } }],
  store_assignments: [{ store_id: 'store-id-1', scope_type: 'SINGLE_STORE' }],
};

const mockTenantRow = { id: 'tenant-id-abc', is_active: true };

const mockAccountRow = {
  userId: 'user-id-123',
  providerId: 'credential',
  password: 'hashed-password',
  user: {
    id: 'user-id-123',
    tenant_id: 'tenant-id-abc',
    email: 'test@example.com',
    is_active: true,
  },
};

const mockSessionRow = {
  id: 'session-id-1',
  token: 'random-session-token',
  user_id: 'user-id-123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

function makeDbMock() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue(mockUserRow),
      update: vi.fn().mockResolvedValue({}),
    },
    tenant: {
      findUnique: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
      create: vi.fn().mockResolvedValue({}),
    },
    session: {
      create: vi.fn().mockResolvedValue(mockSessionRow),
      findUnique: vi.fn(),
      delete: vi.fn().mockResolvedValue({}),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
      const txMock = {
        user: { create: vi.fn().mockResolvedValue(mockUserRow) },
        account: { create: vi.fn().mockResolvedValue({}) },
      };
      return fn(txMock);
    }),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let db: ReturnType<typeof makeDbMock>;

  beforeEach(() => {
    process.env['AUTH_JWT_SECRET'] = 'test-secret-key-min-32-chars-xxxx';
    db = makeDbMock();
    service = new AuthService(db as never);
  });

  // ── signUp ──────────────────────────────────────────────────
  describe('signUp', () => {
    it('should create user and account on valid data', async () => {
      db.tenant.findUnique.mockResolvedValue({ id: 'tenant-id-abc', is_active: true }); // tenant exists
      db.user.findUnique.mockResolvedValue(null); // email not taken

      const result = await service.signUp('new@example.com', 'Password1', 'New User', 'tenant-id-abc');

      expect(result.email).toBe('test@example.com'); // from mockUserRow in tx
    });

    it('should throw ConflictException when email already exists', async () => {
      db.tenant.findUnique.mockResolvedValue({ id: 'tenant-id-abc', is_active: true }); // tenant exists
      db.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.signUp('test@example.com', 'Password1', 'Test', 'tenant-id-abc'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for weak password', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await expect(
        service.signUp('test@example.com', 'weak', 'Test', 'tenant-id-abc'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── signIn ──────────────────────────────────────────────────
  describe('signIn', () => {
    it('should return session token on valid credentials', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow); // tenant check
      db.account.findFirst.mockResolvedValue(mockAccountRow);

      const token = await service.signIn('test@example.com', 'Password1', 'tenant-id-abc');

      expect(token).toBe('random-session-token');
      expect(db.session.create).toHaveBeenCalled();
      expect(db.auditLog.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow); // tenant check
      db.account.findFirst.mockResolvedValue(mockAccountRow);

      await expect(
        service.signIn('test@example.com', 'WrongPassword', 'tenant-id-abc'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account not found', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow); // tenant check
      db.account.findFirst.mockResolvedValue(null);

      await expect(
        service.signIn('notfound@example.com', 'Password1', 'tenant-id-abc'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow); // tenant check
      db.account.findFirst.mockResolvedValue({
        ...mockAccountRow,
        user: { ...mockAccountRow.user, is_active: false },
      });

      await expect(
        service.signIn('test@example.com', 'Password1', 'tenant-id-abc'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── getSession ──────────────────────────────────────────────
  describe('getSession', () => {
    it('should return session with user when valid', async () => {
      db.session.findUnique.mockResolvedValue(mockSessionRow);

      const result = await service.getSession('random-session-token');

      expect(result).not.toBeNull();
      expect(result?.user.email).toBe('test@example.com');
    });

    it('should return null when session not found', async () => {
      db.session.findUnique.mockResolvedValue(null);

      const result = await service.getSession('nonexistent-token');

      expect(result).toBeNull();
    });

    it('should return null and delete expired session', async () => {
      db.session.findUnique.mockResolvedValue({
        ...mockSessionRow,
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      const result = await service.getSession('expired-token');

      expect(result).toBeNull();
      expect(db.session.delete).toHaveBeenCalled();
    });

    it('should return null for inactive user', async () => {
      db.session.findUnique.mockResolvedValue({
        ...mockSessionRow,
        user: { ...mockSessionRow.user, is_active: false },
      });

      const result = await service.getSession('some-token');

      expect(result).toBeNull();
    });
  });

  // ── signOut ──────────────────────────────────────────────────
  describe('signOut', () => {
    it('should delete session and write LOGOUT audit log', async () => {
      db.session.findUnique.mockResolvedValue({
        user_id: 'user-id-123',
        user: { tenant_id: 'tenant-id-abc' },
      });

      await service.signOut('random-session-token');

      expect(db.session.delete).toHaveBeenCalledWith({
        where: { token: 'random-session-token' },
      });
      expect(db.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'LOGOUT' }) }),
      );
    });

    it('should be idempotent when session not found', async () => {
      db.session.findUnique.mockResolvedValue(null);

      await expect(service.signOut('nonexistent-token')).resolves.toBeUndefined();
      expect(db.session.delete).not.toHaveBeenCalled();
    });
  });

  // ── pinLogin ──────────────────────────────────────────────────
  describe('pinLogin', () => {
    it('should return token and user on successful PIN login', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow);
      db.user.findUnique.mockResolvedValue(mockUserRow);

      const result = await service.pinLogin('1234', 'pos-sdd-demo', 'test@example.com');

      expect(result).toMatchObject({
        token: 'mock-jwt-token',
        user: {
          id: 'user-id-123',
          email: 'test@example.com',
          roles: ['cashier'],
        },
      });
      expect(db.auditLog.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for tenant not found', async () => {
      db.tenant.findUnique.mockResolvedValue(null);

      await expect(service.pinLogin('1234', 'wrong-tenant', 'test@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for user not found', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow);
      db.user.findUnique.mockResolvedValue(null);

      await expect(
        service.pinLogin('1234', 'pos-sdd-demo', 'notfound@example.com'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow);
      db.user.findUnique.mockResolvedValue({ ...mockUserRow, is_active: false });

      await expect(service.pinLogin('1234', 'pos-sdd-demo', 'test@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException when user has no PIN set', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow);
      db.user.findUnique.mockResolvedValue({ ...mockUserRow, pin_hash: null });

      await expect(service.pinLogin('1234', 'pos-sdd-demo', 'test@example.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException for wrong PIN', async () => {
      db.tenant.findUnique.mockResolvedValue(mockTenantRow);
      db.user.findUnique.mockResolvedValue(mockUserRow);

      await expect(service.pinLogin('9999', 'pos-sdd-demo', 'test@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── setPinForUser ──────────────────────────────────────────
  describe('setPinForUser', () => {
    it('should hash PIN and update user', async () => {
      await service.setPinForUser('user-id-123', '5678', 'tenant-id-abc');

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
        data: { pin_hash: 'hashed:5678' },
      });
      expect(db.auditLog.create).toHaveBeenCalled();
    });
  });

  // ── resetPinForUser ──────────────────────────────────────
  describe('resetPinForUser', () => {
    const mockAdminUser = {
      user_roles: [{ role: { name: 'system_admin' } }],
    };

    it('should reset PIN for user in same tenant with authorized admin', async () => {
      db.user.findUnique
        .mockResolvedValueOnce(mockAdminUser) // admin role check
        .mockResolvedValueOnce({ tenant_id: 'tenant-id-abc' }); // target user check

      await service.resetPinForUser('admin-id', 'tenant-id-abc', 'user-id-123', '4321');

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
        data: { pin_hash: 'hashed:4321' },
      });
    });

    it('should throw ForbiddenException when admin lacks required role', async () => {
      const unauthorizedAdmin = {
        user_roles: [{ role: { name: 'cashier' } }],
      };
      db.user.findUnique.mockResolvedValueOnce(unauthorizedAdmin);

      await expect(
        service.resetPinForUser('admin-id', 'tenant-id-abc', 'user-id-123', '4321'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when target user does not exist', async () => {
      db.user.findUnique
        .mockResolvedValueOnce(mockAdminUser) // admin role check
        .mockResolvedValueOnce(null); // target user check

      await expect(
        service.resetPinForUser('admin-id', 'tenant-id-abc', 'nonexistent-id', '4321'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for cross-tenant reset', async () => {
      db.user.findUnique
        .mockResolvedValueOnce(mockAdminUser) // admin role check
        .mockResolvedValueOnce({ tenant_id: 'other-tenant-id' }); // target user check

      await expect(
        service.resetPinForUser('admin-id', 'tenant-id-abc', 'user-id-123', '4321'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
