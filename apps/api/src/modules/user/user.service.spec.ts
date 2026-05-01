import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service.js';

// Mock @pos-sdd/shared
vi.mock('@pos-sdd/shared', () => ({
  generateId: () => 'test-uuid-123',
  hashPin: async (pin: string) => `hashed:${pin}`,
  verifyPin: async (pin: string, hash: string) => hash === `hashed:${pin}`,
}));

const mockRole = { id: 'role-id-1', name: 'cashier', tenant_id: 'tenant-abc' };

const mockUserRow = {
  id: 'user-id-123',
  tenant_id: 'tenant-abc',
  email: 'test@example.com',
  name: 'Test User',
  pin_hash: 'hashed:1234',
  is_active: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  user_roles: [{ role: { id: 'role-id-1', name: 'cashier' } }],
  store_assignments: [
    {
      id: 'assign-id-1',
      store_id: 'store-id-1',
      scope_type: 'SINGLE_STORE',
      store: { id: 'store-id-1', name: 'Store 1' },
    },
  ],
};

// mockPrisma dùng chung cho cả direct calls và transaction calls
const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  userRole: { createMany: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn() },
  userStoreAssignment: { findMany: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn() },
  session: { deleteMany: vi.fn() },
  role: { findMany: vi.fn() },
  store: { findMany: vi.fn(), findFirst: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn((fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    userService = new UserService(mockPrisma as never);
  });

  // ──────────── createUser ────────────
  describe('createUser', () => {
    it('happy path: tạo user mới với PIN', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // email không tồn tại
      mockPrisma.role.findMany.mockResolvedValueOnce([mockRole]); // roles hợp lệ
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'user-id-123',
        tenant_id: 'tenant-abc',
        email: 'new@example.com',
        name: 'New User',
        is_active: true,
      });
      mockPrisma.userRole.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      // getUserById call
      mockPrisma.user.findFirst.mockResolvedValueOnce({ ...mockUserRow, email: 'new@example.com', name: 'New User' });

      const result = await userService.createUser(
        'tenant-abc',
        { email: 'new@example.com', name: 'New User', pin: '1234', roleIds: ['role-id-1'] },
        'admin-id',
      );

      expect(result).toBeDefined();
      expect(result.hasPIN).toBe(true);
      expect(result.email).toBe('new@example.com');
    });

    it('happy path: tạo user mới không có PIN', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.role.findMany.mockResolvedValueOnce([mockRole]);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'user-id-123',
        tenant_id: 'tenant-abc',
        email: 'new@example.com',
        name: 'New User',
        is_active: true,
      });
      mockPrisma.userRole.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        ...mockUserRow,
        email: 'new@example.com',
        pin_hash: null,
      });

      const result = await userService.createUser(
        'tenant-abc',
        { email: 'new@example.com', name: 'New User', roleIds: ['role-id-1'] },
        'admin-id',
      );

      expect(result.hasPIN).toBe(false);
    });

    it('duplicate email: ném ConflictException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        userService.createUser(
          'tenant-abc',
          { email: 'existing@example.com', name: 'User', roleIds: ['role-id-1'] },
          'admin-id',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('invalid roles: ném BadRequestException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.role.findMany.mockResolvedValueOnce([]); // roles không tồn tại

      await expect(
        userService.createUser(
          'tenant-abc',
          { email: 'new@example.com', name: 'User', roleIds: ['invalid-role-id'] },
          'admin-id',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('duplicate roleIds: deduplicate trước khi validate', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.role.findMany.mockResolvedValueOnce([mockRole]); // 1 unique role trả về
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'user-id-123',
        tenant_id: 'tenant-abc',
        email: 'new@example.com',
        name: 'New User',
        is_active: true,
      });
      mockPrisma.userRole.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockUserRow);

      // Không nên throw BadRequestException dù có duplicate roleIds
      await expect(
        userService.createUser(
          'tenant-abc',
          { email: 'new@example.com', name: 'New User', roleIds: ['role-id-1', 'role-id-1'] },
          'admin-id',
        ),
      ).resolves.toBeDefined();
    });

    it('PIN hash được tạo đúng', async () => {
      const { hashPin } = await import('@pos-sdd/shared');
      const hash = await hashPin('1234');
      expect(hash).toBe('hashed:1234');
    });

    it('audit log dùng adminUserId, không phải userId mới tạo', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.role.findMany.mockResolvedValueOnce([mockRole]);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'user-id-123',
        tenant_id: 'tenant-abc',
        email: 'new@example.com',
        name: 'New User',
        is_active: true,
      });
      mockPrisma.userRole.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockUserRow);

      await userService.createUser(
        'tenant-abc',
        { email: 'new@example.com', name: 'New User', roleIds: ['role-id-1'] },
        'admin-user-id',
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ user_id: 'admin-user-id' }),
        }),
      );
    });

    it('throw InternalServerErrorException nếu getUserById trả null sau create', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.role.findMany.mockResolvedValueOnce([mockRole]);
      mockPrisma.user.create.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.userRole.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockPrisma.user.findFirst.mockResolvedValueOnce(null); // getUserById returns null

      await expect(
        userService.createUser(
          'tenant-abc',
          { email: 'new@example.com', name: 'New User', roleIds: ['role-id-1'] },
          'admin-id',
        ),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // ──────────── updateUser ────────────
  describe('updateUser', () => {
    it('happy path: cập nhật tên', async () => {
      mockPrisma.user.findFirst
        .mockResolvedValueOnce({ id: 'user-id-123', name: 'Old Name', email: 'test@example.com', is_active: true })
        .mockResolvedValueOnce(mockUserRow);
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await userService.updateUser('user-id-123', 'tenant-abc', { name: 'New Name' }, 'admin-id');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-123', tenant_id: 'tenant-abc' },
        data: { name: 'New Name' },
      });
      expect(result).toBeDefined();
    });

    it('email conflict: ném ConflictException', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-id-123',
        name: 'User',
        email: 'old@example.com',
        is_active: true,
      });
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'other-user' });

      await expect(
        userService.updateUser('user-id-123', 'tenant-abc', { email: 'taken@example.com' }, 'admin-id'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('user not found: ném NotFoundException', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.updateUser('non-existent', 'tenant-abc', { name: 'Name' }, 'admin-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('cross-tenant blocked: ném NotFoundException', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null); // tenant_id mismatch → không tìm thấy

      await expect(
        userService.updateUser('user-id-123', 'other-tenant', { name: 'Name' }, 'admin-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('update WHERE clause bao gồm tenant_id', async () => {
      mockPrisma.user.findFirst
        .mockResolvedValueOnce({ id: 'user-id-123', name: 'Old', email: 'test@example.com', is_active: true })
        .mockResolvedValueOnce(mockUserRow);
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      await userService.updateUser('user-id-123', 'tenant-abc', { name: 'New' }, 'admin-id');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenant_id: 'tenant-abc' }),
        }),
      );
    });
  });

  // ──────────── deactivateUser ────────────
  describe('deactivateUser', () => {
    it('happy path: vô hiệu hóa user', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123', is_active: true });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 2 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await userService.deactivateUser('user-id-123', 'tenant-abc', 'admin-id');

      expect(result).toEqual({ success: true });
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-id-123' } });
    });

    it('self-deactivation blocked: ném BadRequestException', async () => {
      // Self-check trước DB — không cần mock findFirst
      await expect(
        userService.deactivateUser('admin-id', 'tenant-abc', 'admin-id'),
      ).rejects.toBeInstanceOf(BadRequestException);

      // findFirst KHÔNG được gọi vì check self trước
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('sessions cleared: session.deleteMany được gọi', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123', is_active: true });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 3 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      await userService.deactivateUser('user-id-123', 'tenant-abc', 'admin-id');

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-id-123' } });
    });

    it('user not found: ném NotFoundException', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.deactivateUser('non-existent', 'tenant-abc', 'admin-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('audit log chứa old_data và new_data', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123', is_active: true });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      await userService.deactivateUser('user-id-123', 'tenant-abc', 'admin-id');

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            old_data: { is_active: true },
            new_data: { is_active: false },
          }),
        }),
      );
    });

    it('update WHERE clause bao gồm tenant_id', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123', is_active: true });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 0 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      await userService.deactivateUser('user-id-123', 'tenant-abc', 'admin-id');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenant_id: 'tenant-abc' }),
        }),
      );
    });
  });

  // ──────────── activateUser ────────────
  describe('activateUser', () => {
    it('happy path: kích hoạt user', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123', is_active: false });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await userService.activateUser('user-id-123', 'tenant-abc', 'admin-id');

      expect(result).toEqual({ success: true });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-123', tenant_id: 'tenant-abc' },
        data: { is_active: true },
      });
    });

    it('user not found: ném NotFoundException', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.activateUser('non-existent', 'tenant-abc', 'admin-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('audit log chứa old_data và new_data', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123', is_active: false });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      await userService.activateUser('user-id-123', 'tenant-abc', 'admin-id');

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            old_data: { is_active: false },
            new_data: { is_active: true },
          }),
        }),
      );
    });
  });

  // ──────────── getUserById ────────────
  describe('getUserById', () => {
    it('happy path: trả về user với roles và store_assignments', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockUserRow);

      const result = await userService.getUserById('user-id-123', 'tenant-abc');

      expect(result).toBeDefined();
      expect(result!.id).toBe('user-id-123');
      expect(result!.roles).toHaveLength(1);
      expect(result!.storeAssignments).toHaveLength(1);
      expect('pin_hash' in result!).toBe(false);
      expect('password_hash' in result!).toBe(false);
      expect(result!.hasPIN).toBe(true);
    });

    it('user không có PIN: hasPIN = false', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ ...mockUserRow, pin_hash: null });

      const result = await userService.getUserById('user-id-123', 'tenant-abc');
      expect(result!.hasPIN).toBe(false);
    });

    it('cross-tenant returns null', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      const result = await userService.getUserById('user-id-123', 'other-tenant');
      expect(result).toBeNull();
    });
  });

  // ──────────── assignRoles ────────────
  describe('assignRoles', () => {
    it('happy path: gán roles thành công', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.role.findMany.mockResolvedValueOnce([{ id: 'role-id-1' }, { id: 'role-id-2' }]);
      mockPrisma.userRole.findMany.mockResolvedValueOnce([{ role_id: 'role-id-old' }]);
      mockPrisma.userRole.deleteMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.userRole.createMany.mockResolvedValueOnce({ count: 2 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      // findMany sau transaction để lấy roles mới
      mockPrisma.userRole.findMany.mockResolvedValueOnce([
        { role: { id: 'role-id-1', name: 'cashier' } },
        { role: { id: 'role-id-2', name: 'shift_lead' } },
      ]);

      const result = await userService.assignRoles(
        'user-id-123', 'tenant-abc', 'admin-id',
        { roleIds: ['role-id-1', 'role-id-2'] },
      );

      expect(result.userId).toBe('user-id-123');
      expect(result.roles).toHaveLength(2);
      expect(mockPrisma.userRole.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'user-id-123' } });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'UPDATE', resource: 'user_role' }),
        }),
      );
    });

    it('throw NotFoundException nếu user không tồn tại', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.assignRoles('non-existent', 'tenant-abc', 'admin-id', { roleIds: ['role-id-1'] }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throw BadRequestException nếu roleId không hợp lệ', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.role.findMany.mockResolvedValueOnce([]); // 0 roles found, nhưng cần 1

      await expect(
        userService.assignRoles('user-id-123', 'tenant-abc', 'admin-id', { roleIds: ['invalid-role-id'] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('audit log ghi nhận old_roles và new_roles', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.role.findMany.mockResolvedValueOnce([{ id: 'role-id-new' }]);
      mockPrisma.userRole.findMany.mockResolvedValueOnce([{ role_id: 'role-id-old' }]);
      mockPrisma.userRole.deleteMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.userRole.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockPrisma.userRole.findMany.mockResolvedValueOnce([{ role: { id: 'role-id-new', name: 'manager' } }]);

      await userService.assignRoles('user-id-123', 'tenant-abc', 'admin-id', { roleIds: ['role-id-new'] });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: { old_roles: ['role-id-old'], new_roles: ['role-id-new'] },
          }),
        }),
      );
    });
  });

  // ──────────── assignStoreScopes ────────────
  describe('assignStoreScopes', () => {
    it('happy path: gán store assignments thành công', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.store.findMany.mockResolvedValueOnce([{ id: 'store-id-1' }]);
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([]);
      mockPrisma.userStoreAssignment.deleteMany.mockResolvedValueOnce({ count: 0 });
      mockPrisma.userStoreAssignment.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      // sau transaction, lấy assignments mới
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([
        { store_id: 'store-id-1', scope_type: 'SINGLE_STORE' },
      ]);

      const result = await userService.assignStoreScopes(
        'user-id-123', 'tenant-abc', 'admin-id',
        { assignments: [{ storeId: 'store-id-1', scopeType: 'SINGLE_STORE' }] },
      );

      expect(result.userId).toBe('user-id-123');
      expect(result.assignments).toHaveLength(1);
      expect(result.assignments[0]!.storeId).toBe('store-id-1');
      expect(mockPrisma.userStoreAssignment.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'user-id-123' } });
    });

    it('happy path: gán ALL_STORES scope không cần storeId', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([]);
      mockPrisma.userStoreAssignment.deleteMany.mockResolvedValueOnce({ count: 0 });
      mockPrisma.userStoreAssignment.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([
        { store_id: null, scope_type: 'ALL_STORES' },
      ]);

      const result = await userService.assignStoreScopes(
        'user-id-123', 'tenant-abc', 'admin-id',
        { assignments: [{ scopeType: 'ALL_STORES' }] },
      );

      expect(result.assignments[0]!.scopeType).toBe('ALL_STORES');
      expect(result.assignments[0]!.storeId).toBeNull();
    });

    it('throw NotFoundException nếu user không tồn tại', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.assignStoreScopes('non-existent', 'tenant-abc', 'admin-id', {
          assignments: [{ storeId: 'store-id-1', scopeType: 'SINGLE_STORE' }],
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throw BadRequestException nếu storeId không thuộc tenant', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.store.findMany.mockResolvedValueOnce([]); // 0 stores found

      await expect(
        userService.assignStoreScopes('user-id-123', 'tenant-abc', 'admin-id', {
          assignments: [{ storeId: 'invalid-store-id', scopeType: 'SINGLE_STORE' }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throw BadRequestException nếu có 2 ALL_STORES assignments', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });

      await expect(
        userService.assignStoreScopes('user-id-123', 'tenant-abc', 'admin-id', {
          assignments: [
            { storeId: 'store-id-1', scopeType: 'ALL_STORES' },
            { storeId: 'store-id-2', scopeType: 'ALL_STORES' },
          ],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throw BadRequestException nếu ALL_STORES kết hợp với SINGLE_STORE', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });

      await expect(
        userService.assignStoreScopes('user-id-123', 'tenant-abc', 'admin-id', {
          assignments: [
            { storeId: 'store-id-1', scopeType: 'ALL_STORES' },
            { storeId: 'store-id-2', scopeType: 'SINGLE_STORE' },
          ],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throw BadRequestException nếu có duplicate storeId+scopeType', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });

      await expect(
        userService.assignStoreScopes('user-id-123', 'tenant-abc', 'admin-id', {
          assignments: [
            { storeId: 'store-id-1', scopeType: 'SINGLE_STORE' },
            { storeId: 'store-id-1', scopeType: 'SINGLE_STORE' },
          ],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('happy path: assignments rỗng xóa toàn bộ store assignments', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([
        { store_id: 'store-id-old', scope_type: 'SINGLE_STORE' },
      ]);
      mockPrisma.userStoreAssignment.deleteMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([]);

      const result = await userService.assignStoreScopes(
        'user-id-123', 'tenant-abc', 'admin-id',
        { assignments: [] },
      );

      expect(result.assignments).toHaveLength(0);
      expect(mockPrisma.userStoreAssignment.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'user-id-123' } });
      expect(mockPrisma.userStoreAssignment.createMany).not.toHaveBeenCalled();
    });

    it('audit log ghi nhận old_assignments và new_assignments', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.store.findMany.mockResolvedValueOnce([{ id: 'store-id-1' }]);
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([
        { store_id: 'store-id-old', scope_type: 'SINGLE_STORE' },
      ]);
      mockPrisma.userStoreAssignment.deleteMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.userStoreAssignment.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([
        { store_id: 'store-id-1', scope_type: 'SINGLE_STORE' },
      ]);

      await userService.assignStoreScopes('user-id-123', 'tenant-abc', 'admin-id', {
        assignments: [{ storeId: 'store-id-1', scopeType: 'SINGLE_STORE' }],
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: 'user_store_assignment',
            metadata: expect.objectContaining({
              old_assignments: expect.arrayContaining([
                { storeId: 'store-id-old', scopeType: 'SINGLE_STORE' },
              ]),
            }),
          }),
        }),
      );
    });
  });

  // ──────────── getStoreAssignments ────────────
  describe('getStoreAssignments', () => {
    it('happy path: trả về danh sách assignments với store details', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([
        {
          id: 'assign-id-1',
          store_id: 'store-id-1',
          scope_type: 'SINGLE_STORE',
          store: { id: 'store-id-1', name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ', is_active: true },
        },
      ]);

      const result = await userService.getStoreAssignments('user-id-123', 'tenant-abc');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.storeId).toBe('store-id-1');
      expect(result.data[0]!.scopeType).toBe('SINGLE_STORE');
      expect(result.data[0]!.store?.name).toBe('Chi nhánh Quận 1');
    });

    it('ALL_STORES assignment trả về store = null', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([
        { id: 'assign-id-2', store_id: null, scope_type: 'ALL_STORES', store: null },
      ]);

      const result = await userService.getStoreAssignments('user-id-123', 'tenant-abc');

      expect(result.data[0]!.storeId).toBeNull();
      expect(result.data[0]!.scopeType).toBe('ALL_STORES');
      expect(result.data[0]!.store).toBeNull();
    });

    it('trả về mảng rỗng nếu chưa có assignments', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-id-123' });
      mockPrisma.userStoreAssignment.findMany.mockResolvedValueOnce([]);

      const result = await userService.getStoreAssignments('user-id-123', 'tenant-abc');

      expect(result.data).toHaveLength(0);
    });

    it('throw NotFoundException nếu user không tồn tại hoặc cross-tenant', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.getStoreAssignments('user-id-123', 'tenant-other'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ──────────── listUsers ────────────
  describe('listUsers', () => {
    it('happy path: trả về danh sách với pagination', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([mockUserRow]);
      mockPrisma.user.count.mockResolvedValueOnce(1);

      const result = await userService.listUsers('tenant-abc', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
    });

    it('pagination: đúng skip và take', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);
      mockPrisma.user.count.mockResolvedValueOnce(50);

      await userService.listUsers('tenant-abc', { page: 3, limit: 10 });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('search filter: tìm theo name hoặc email', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);
      mockPrisma.user.count.mockResolvedValueOnce(0);

      await userService.listUsers('tenant-abc', { search: 'john' });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { name: { contains: 'john', mode: 'insensitive' } },
                  { email: { contains: 'john', mode: 'insensitive' } },
                ]),
              }),
            ]),
          }),
        }),
      );
    });

    it('role filter: lọc theo roleId', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);
      mockPrisma.user.count.mockResolvedValueOnce(0);

      await userService.listUsers('tenant-abc', { roleId: 'role-id-1' });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { user_roles: { some: { role_id: 'role-id-1' } } },
            ]),
          }),
        }),
      );
    });

    it('isActive filter: lọc theo trạng thái', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);
      mockPrisma.user.count.mockResolvedValueOnce(0);

      await userService.listUsers('tenant-abc', { isActive: false });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { is_active: false },
            ]),
          }),
        }),
      );
    });

    it('empty results: trả về mảng rỗng', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);
      mockPrisma.user.count.mockResolvedValueOnce(0);

      const result = await userService.listUsers('tenant-abc', {});

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('tenant isolation: chỉ lấy users của tenant hiện tại', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);
      mockPrisma.user.count.mockResolvedValueOnce(0);

      await userService.listUsers('tenant-abc', {});

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenant_id: 'tenant-abc' }),
        }),
      );
    });
  });
});
