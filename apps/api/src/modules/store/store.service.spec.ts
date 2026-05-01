import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { StoreService } from './store.service.js';

vi.mock('@pos-sdd/shared', () => ({
  generateId: () => 'test-uuid-123',
}));

const mockStoreRow = {
  id: 'store-id-1',
  name: 'Chi nhánh Quận 1',
  address: '123 Nguyễn Huệ, Quận 1',
  phone: '028-1234-5678',
  is_active: true,
  tenant_id: 'tenant-abc',
  settings: {},
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  _count: { user_assignments: 3 },
};

const mockPrisma = {
  store: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

const mockDbService = {
  store: mockPrisma.store,
  auditLog: mockPrisma.auditLog,
  $transaction: vi.fn((fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)),
};

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StoreService(mockDbService as unknown as import('../database/database.service.js').DatabaseService);
  });

  // ─── listStores ─────────────────────────────────────────────────────────────

  describe('listStores', () => {
    it('trả về danh sách stores với pagination mặc định', async () => {
      mockPrisma.store.findMany.mockResolvedValueOnce([mockStoreRow]);
      mockPrisma.store.count.mockResolvedValueOnce(1);

      const result = await service.listStores('tenant-abc', {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.id).toBe('store-id-1');
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
    });

    it('filter by isActive = true', async () => {
      mockPrisma.store.findMany.mockResolvedValueOnce([mockStoreRow]);
      mockPrisma.store.count.mockResolvedValueOnce(1);

      await service.listStores('tenant-abc', { isActive: true });

      const callArgs = mockPrisma.store.findMany.mock.calls[0]![0];
      expect(callArgs.where.AND).toContainEqual({ is_active: true });
    });

    it('filter by search term (name hoặc address)', async () => {
      mockPrisma.store.findMany.mockResolvedValueOnce([mockStoreRow]);
      mockPrisma.store.count.mockResolvedValueOnce(1);

      await service.listStores('tenant-abc', { search: 'Quận 1' });

      const callArgs = mockPrisma.store.findMany.mock.calls[0]![0];
      expect(callArgs.where.AND).toContainEqual({
        OR: [
          { name: { contains: 'Quận 1', mode: 'insensitive' } },
          { address: { contains: 'Quận 1', mode: 'insensitive' } },
        ],
      });
    });

    it('áp dụng pagination tùy chỉnh', async () => {
      mockPrisma.store.findMany.mockResolvedValueOnce([]);
      mockPrisma.store.count.mockResolvedValueOnce(0);

      await service.listStores('tenant-abc', { page: 2, limit: 5 });

      const callArgs = mockPrisma.store.findMany.mock.calls[0]![0];
      expect(callArgs.skip).toBe(5);
      expect(callArgs.take).toBe(5);
    });
  });

  // ─── getStoreById ────────────────────────────────────────────────────────────

  describe('getStoreById', () => {
    it('trả về store detail theo id', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce(mockStoreRow);

      const result = await service.getStoreById('store-id-1', 'tenant-abc');

      expect(result.id).toBe('store-id-1');
      expect(result.userCount).toBe(3);
      expect(mockPrisma.store.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'store-id-1', tenant_id: 'tenant-abc' } }),
      );
    });

    it('ném NotFoundException nếu không tìm thấy store', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce(null);

      await expect(service.getStoreById('not-found', 'tenant-abc')).rejects.toThrow(NotFoundException);
    });

    it('cross-tenant blocked: chỉ tìm trong tenant_id tương ứng', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce(null);

      await expect(service.getStoreById('store-id-1', 'tenant-xyz')).rejects.toThrow(NotFoundException);

      expect(mockPrisma.store.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'store-id-1', tenant_id: 'tenant-xyz' } }),
      );
    });
  });

  // ─── createStore ─────────────────────────────────────────────────────────────

  describe('createStore', () => {
    it('tạo store mới thành công', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce(null); // no duplicate
      mockPrisma.store.create.mockResolvedValueOnce(mockStoreRow);
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await service.createStore('tenant-abc', { name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ' }, 'admin-id');

      expect(result.id).toBe('store-id-1');
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'CREATE', resource: 'store' }),
        }),
      );
    });

    it('ném ConflictException nếu tên store đã tồn tại trong tenant', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce(mockStoreRow); // duplicate

      await expect(
        service.createStore('tenant-abc', { name: 'Chi nhánh Quận 1' }, 'admin-id'),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.store.create).not.toHaveBeenCalled();
    });
  });

  // ─── updateStore ─────────────────────────────────────────────────────────────

  describe('updateStore', () => {
    it('cập nhật store thành công', async () => {
      const updatedRow = { ...mockStoreRow, name: 'Chi nhánh Quận 1 (Updated)' };
      mockPrisma.store.findFirst
        .mockResolvedValueOnce(mockStoreRow) // initial find
        .mockResolvedValueOnce(null); // name conflict check
      mockPrisma.store.update.mockResolvedValueOnce(updatedRow);
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await service.updateStore('store-id-1', 'tenant-abc', { name: 'Chi nhánh Quận 1 (Updated)' }, 'admin-id');

      expect(result.name).toBe('Chi nhánh Quận 1 (Updated)');
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'UPDATE', resource: 'store' }),
        }),
      );
    });

    it('ném NotFoundException nếu store không tồn tại', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.updateStore('not-found', 'tenant-abc', { name: 'New Name' }, 'admin-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném ConflictException nếu name mới đã tồn tại', async () => {
      const otherStore = { ...mockStoreRow, id: 'store-id-2', name: 'Chi nhánh Quận 3' };
      mockPrisma.store.findFirst
        .mockResolvedValueOnce(mockStoreRow) // initial find
        .mockResolvedValueOnce(otherStore); // name conflict

      await expect(
        service.updateStore('store-id-1', 'tenant-abc', { name: 'Chi nhánh Quận 3' }, 'admin-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── deactivateStore ──────────────────────────────────────────────────────────

  describe('deactivateStore', () => {
    it('deactivate store thành công', async () => {
      const deactivatedRow = { ...mockStoreRow, is_active: false };
      mockPrisma.store.findFirst.mockResolvedValueOnce(mockStoreRow);
      mockPrisma.store.update.mockResolvedValueOnce(deactivatedRow);
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await service.deactivateStore('store-id-1', 'tenant-abc', 'admin-id');

      expect(result.isActive).toBe(false);
    });

    it('ghi audit log với active_assignment_count trong metadata', async () => {
      const storeWithAssignments = { ...mockStoreRow, _count: { user_assignments: 5 } };
      mockPrisma.store.findFirst.mockResolvedValueOnce(storeWithAssignments);
      mockPrisma.store.update.mockResolvedValueOnce({ ...storeWithAssignments, is_active: false });
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      await service.deactivateStore('store-id-1', 'tenant-abc', 'admin-id');

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: expect.objectContaining({ active_assignment_count: 5 }),
          }),
        }),
      );
    });

    it('ném NotFoundException nếu store không tồn tại', async () => {
      mockPrisma.store.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.deactivateStore('not-found', 'tenant-abc', 'admin-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
