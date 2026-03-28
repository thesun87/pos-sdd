import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { RoleService } from './role.service.js';

vi.mock('@pos-sdd/shared', () => ({
  generateId: () => 'test-uuid-123',
}));

const mockRoleRow = {
  id: 'role-id-1',
  name: 'cashier',
  description: 'Thu ngân',
  is_system: true,
  permissions: {},
  tenant_id: 'tenant-abc',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  _count: { user_roles: 3 },
};

const mockCustomRoleRow = {
  ...mockRoleRow,
  id: 'role-id-custom',
  name: 'custom_role',
  is_system: false,
  _count: { user_roles: 0 },
};

const mockPolicyRow = {
  id: 'policy-id-1',
  tenant_id: 'tenant-abc',
  store_id: null,
  role: 'cashier',
  action: 'discount',
  resource: 'order',
  limit: 10,
  override_role: 'shift_lead',
  conditions: null,
  is_active: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

const mockPrisma = {
  role: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  policy: {
    findMany: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

const mockDbService = {
  role: mockPrisma.role,
  policy: mockPrisma.policy,
  auditLog: mockPrisma.auditLog,
  getClient: vi.fn().mockReturnValue(mockPrisma),
  $transaction: vi.fn((fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)),
};

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RoleService(mockDbService as unknown as import('../database/database.service.js').DatabaseService);
  });

  // ─── listRoles ───────────────────────────────────────────────────────────────

  describe('listRoles', () => {
    it('trả về danh sách roles với pagination mặc định', async () => {
      mockPrisma.role.findMany.mockResolvedValue([mockRoleRow]);
      mockPrisma.role.count.mockResolvedValue(1);

      const result = await service.listRoles('tenant-abc', {});

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.data[0]).toMatchObject({
        id: 'role-id-1',
        name: 'cashier',
        isSystem: true,
        usersCount: 3,
      });
    });

    it('filter by isSystem', async () => {
      mockPrisma.role.findMany.mockResolvedValue([mockRoleRow]);
      mockPrisma.role.count.mockResolvedValue(1);

      await service.listRoles('tenant-abc', { isSystem: true });

      expect(mockPrisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([{ is_system: true }]),
          }),
        }),
      );
    });

    it('filter by search', async () => {
      mockPrisma.role.findMany.mockResolvedValue([]);
      mockPrisma.role.count.mockResolvedValue(0);

      await service.listRoles('tenant-abc', { search: 'cash' });

      expect(mockPrisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([{ name: { contains: 'cash', mode: 'insensitive' } }]),
          }),
        }),
      );
    });

    it('pagination: page 2, limit 5', async () => {
      mockPrisma.role.findMany.mockResolvedValue([]);
      mockPrisma.role.count.mockResolvedValue(10);

      const result = await service.listRoles('tenant-abc', { page: 2, limit: 5 });

      expect(result.meta).toEqual({ page: 2, limit: 5, total: 10 });
      expect(mockPrisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  // ─── getRoleById ─────────────────────────────────────────────────────────────

  describe('getRoleById', () => {
    it('trả về role detail với policies', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(mockRoleRow);
      mockPrisma.policy.findMany.mockResolvedValue([mockPolicyRow]);

      const result = await service.getRoleById('role-id-1', 'tenant-abc');

      expect(result.id).toBe('role-id-1');
      expect(result.policies).toHaveLength(1);
      expect(result.policies[0]).toMatchObject({
        action: 'discount',
        resource: 'order',
        limit: 10,
        overrideRole: 'shift_lead',
      });
    });

    it('throw NotFoundException nếu không tìm thấy', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(null);

      await expect(service.getRoleById('nonexistent', 'tenant-abc')).rejects.toThrow(NotFoundException);
    });

    it('không trả về role của tenant khác (cross-tenant)', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(null);

      await expect(service.getRoleById('role-id-1', 'other-tenant')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── createRole ──────────────────────────────────────────────────────────────

  describe('createRole', () => {
    it('tạo custom role thành công', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(null); // name không trùng
      mockPrisma.role.create.mockResolvedValue(mockCustomRoleRow);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createRole(
        'tenant-abc',
        { name: 'custom_role', description: 'Custom', permissions: { read: true } },
        'admin-id',
      );

      expect(result.name).toBe('custom_role');
      expect(result.isSystem).toBe(false);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'CREATE', resource: 'role' }),
        }),
      );
    });

    it('throw ConflictException nếu tên trùng', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(mockRoleRow);

      await expect(
        service.createRole('tenant-abc', { name: 'cashier' }, 'admin-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── updateRole ──────────────────────────────────────────────────────────────

  describe('updateRole', () => {
    it('cập nhật custom role thành công', async () => {
      const updatedRow = { ...mockCustomRoleRow, name: 'updated_role' };
      mockPrisma.role.findFirst
        .mockResolvedValueOnce(mockCustomRoleRow)  // tìm role
        .mockResolvedValueOnce(null);              // name unique check: không trùng
      mockPrisma.role.update.mockResolvedValueOnce(updatedRow);
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await service.updateRole('role-id-custom', 'tenant-abc', { name: 'updated_role' }, 'admin-id');

      expect(result.name).toBe('updated_role');
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'UPDATE', resource: 'role' }),
        }),
      );
    });

    it('throw ForbiddenException khi cố sửa system role', async () => {
      mockPrisma.role.findFirst.mockResolvedValueOnce(mockRoleRow); // is_system = true

      await expect(
        service.updateRole('role-id-1', 'tenant-abc', { name: 'new_name' }, 'admin-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throw NotFoundException nếu không tìm thấy role', async () => {
      mockPrisma.role.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.updateRole('nonexistent', 'tenant-abc', { name: 'x' }, 'admin-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throw ConflictException nếu tên mới trùng với role khác', async () => {
      mockPrisma.role.findFirst
        .mockResolvedValueOnce(mockCustomRoleRow)  // tìm role
        .mockResolvedValueOnce(mockRoleRow);       // name unique check: tìm thấy trùng

      await expect(
        service.updateRole('role-id-custom', 'tenant-abc', { name: 'cashier' }, 'admin-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── deleteRole ──────────────────────────────────────────────────────────────

  describe('deleteRole', () => {
    it('xóa custom role thành công', async () => {
      const roleWithNoUsers = { ...mockCustomRoleRow, _count: { user_roles: 0 } };
      mockPrisma.role.findFirst.mockResolvedValue(roleWithNoUsers);
      mockPrisma.role.delete.mockResolvedValue(roleWithNoUsers);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.deleteRole('role-id-custom', 'tenant-abc', 'admin-id');

      expect(result).toEqual({ success: true });
      expect(mockPrisma.role.delete).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'DELETE', resource: 'role' }),
        }),
      );
    });

    it('throw ForbiddenException khi xóa system role', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(mockRoleRow); // is_system = true

      await expect(service.deleteRole('role-id-1', 'tenant-abc', 'admin-id')).rejects.toThrow(ForbiddenException);
    });

    it('throw ConflictException khi role đang có users', async () => {
      const roleWithUsers = { ...mockCustomRoleRow, _count: { user_roles: 5 } };
      mockPrisma.role.findFirst.mockResolvedValue(roleWithUsers);

      await expect(service.deleteRole('role-id-custom', 'tenant-abc', 'admin-id')).rejects.toThrow(ConflictException);
    });

    it('throw NotFoundException nếu không tìm thấy role', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(null);

      await expect(service.deleteRole('nonexistent', 'tenant-abc', 'admin-id')).rejects.toThrow(NotFoundException);
    });
  });
});
