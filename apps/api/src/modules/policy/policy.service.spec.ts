import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PolicyService } from './policy.service.js';

vi.mock('@pos-sdd/shared', () => ({
  generateId: () => 'test-uuid-123',
}));

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

const mockRoleRow = {
  id: 'role-id-1',
  name: 'cashier',
  tenant_id: 'tenant-abc',
};

const mockPrisma = {
  policy: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  role: {
    findFirst: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

const mockDbService = {
  policy: mockPrisma.policy,
  role: mockPrisma.role,
  auditLog: mockPrisma.auditLog,
  $transaction: vi.fn((fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)),
};

describe('PolicyService', () => {
  let service: PolicyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PolicyService(mockDbService as unknown as import('../database/database.service.js').DatabaseService);
  });

  // ─── listPolicies ─────────────────────────────────────────────────────────────

  describe('listPolicies', () => {
    it('trả về danh sách policies với pagination', async () => {
      mockPrisma.policy.findMany.mockResolvedValue([mockPolicyRow]);
      mockPrisma.policy.count.mockResolvedValue(1);

      const result = await service.listPolicies('tenant-abc', {});

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
    });

    it('filter by role, action, resource', async () => {
      mockPrisma.policy.findMany.mockResolvedValue([]);
      mockPrisma.policy.count.mockResolvedValue(0);

      await service.listPolicies('tenant-abc', { role: 'cashier', action: 'discount', resource: 'order' });

      expect(mockPrisma.policy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { role: 'cashier' },
              { action: 'discount' },
              { resource: 'order' },
            ]),
          }),
        }),
      );
    });
  });

  // ─── createPolicy ─────────────────────────────────────────────────────────────

  describe('createPolicy', () => {
    it('tạo policy thành công', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(mockRoleRow);
      mockPrisma.policy.findFirst.mockResolvedValue(null);
      mockPrisma.policy.create.mockResolvedValue(mockPolicyRow);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createPolicy(
        'tenant-abc',
        { role: 'cashier', action: 'discount', resource: 'order', limit: 10 },
        'admin-id',
      );

      expect(result.role).toBe('cashier');
      expect(result.action).toBe('discount');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('throw BadRequestException nếu role không tồn tại', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(null);

      await expect(
        service.createPolicy('tenant-abc', { role: 'invalid_role', action: 'discount', resource: 'order' }, 'admin-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throw ConflictException nếu policy trùng', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(mockRoleRow);
      mockPrisma.policy.findFirst.mockResolvedValue(mockPolicyRow);

      await expect(
        service.createPolicy('tenant-abc', { role: 'cashier', action: 'discount', resource: 'order' }, 'admin-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── updatePolicy ─────────────────────────────────────────────────────────────

  describe('updatePolicy', () => {
    it('cập nhật policy thành công', async () => {
      const updatedPolicy = { ...mockPolicyRow, limit: 20 };
      mockPrisma.policy.findFirst.mockResolvedValue(mockPolicyRow);
      mockPrisma.policy.update.mockResolvedValue(updatedPolicy);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.updatePolicy('policy-id-1', 'tenant-abc', { limit: 20 }, 'admin-id');

      expect(result.limit).toBe(20);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'UPDATE', resource: 'policy' }),
        }),
      );
    });

    it('throw NotFoundException nếu không tìm thấy policy', async () => {
      mockPrisma.policy.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePolicy('nonexistent', 'tenant-abc', { limit: 20 }, 'admin-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deletePolicy ─────────────────────────────────────────────────────────────

  describe('deletePolicy', () => {
    it('xóa policy thành công', async () => {
      mockPrisma.policy.findFirst.mockResolvedValue(mockPolicyRow);
      mockPrisma.policy.delete.mockResolvedValue(mockPolicyRow);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.deletePolicy('policy-id-1', 'tenant-abc', 'admin-id');

      expect(result).toEqual({ success: true });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'DELETE', resource: 'policy' }),
        }),
      );
    });

    it('throw NotFoundException nếu không tìm thấy policy', async () => {
      mockPrisma.policy.findFirst.mockResolvedValue(null);

      await expect(
        service.deletePolicy('nonexistent', 'tenant-abc', 'admin-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
