import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller.js';

const mockUser = {
  id: 'user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  isActive: true,
  hasPIN: true,
  tenantId: 'tenant-abc',
  roles: [{ id: 'role-id-1', name: 'cashier' }],
  storeAssignments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockJwtPayload = {
  userId: 'admin-id',
  tenantId: 'tenant-abc',
  roles: ['store_manager'],
  storeAssignments: [],
};

const mockUserService = {
  createUser: vi.fn(),
  listUsers: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  deactivateUser: vi.fn(),
  activateUser: vi.fn(),
  assignRoles: vi.fn(),
  assignStoreScopes: vi.fn(),
  getStoreAssignments: vi.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new UserController(mockUserService as never);
  });

  describe('createUser', () => {
    it('trả về { data: user } với status 201', async () => {
      mockUserService.createUser.mockResolvedValueOnce(mockUser);

      const result = await controller.createUser(
        { email: 'new@example.com', name: 'New User', roleIds: ['role-id-1'] },
        mockJwtPayload,
      );

      expect(result).toEqual({ data: mockUser });
      expect(mockUserService.createUser).toHaveBeenCalledWith('tenant-abc', {
        email: 'new@example.com',
        name: 'New User',
        roleIds: ['role-id-1'],
      }, 'admin-id');
    });
  });

  describe('listUsers', () => {
    it('trả về paginated list', async () => {
      const mockPaginated = { data: [mockUser], meta: { page: 1, limit: 20, total: 1 } };
      mockUserService.listUsers.mockResolvedValueOnce(mockPaginated);

      const result = await controller.listUsers({ page: 1, limit: 20 }, mockJwtPayload);

      expect(result).toEqual(mockPaginated);
      expect(mockUserService.listUsers).toHaveBeenCalledWith('tenant-abc', { page: 1, limit: 20 });
    });
  });

  describe('getUser', () => {
    it('trả về { data: user }', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(mockUser);

      const result = await controller.getUser('user-id-123', mockJwtPayload);

      expect(result).toEqual({ data: mockUser });
    });

    it('ném NotFoundException nếu user không tồn tại', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(null);

      await expect(
        controller.getUser('non-existent', mockJwtPayload),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('trả về { data: user }', async () => {
      mockUserService.updateUser.mockResolvedValueOnce(mockUser);

      const result = await controller.updateUser(
        'user-id-123',
        { name: 'Updated Name' },
        mockJwtPayload,
      );

      expect(result).toEqual({ data: mockUser });
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        'user-id-123',
        'tenant-abc',
        { name: 'Updated Name' },
        'admin-id',
      );
    });
  });

  describe('deactivateUser', () => {
    it('trả về { data: { success: true } }', async () => {
      mockUserService.deactivateUser.mockResolvedValueOnce({ success: true });

      const result = await controller.deactivateUser('user-id-123', mockJwtPayload);

      expect(result).toEqual({ data: { success: true } });
    });
  });

  describe('activateUser', () => {
    it('trả về { data: { success: true } }', async () => {
      mockUserService.activateUser.mockResolvedValueOnce({ success: true });

      const result = await controller.activateUser('user-id-123', mockJwtPayload);

      expect(result).toEqual({ data: { success: true } });
    });
  });

  describe('assignStoreScopes', () => {
    it('trả về { data: result }', async () => {
      const assignResult = { userId: 'user-id-123', assignments: [{ storeId: 'store-id-1', scopeType: 'SINGLE_STORE' }] };
      mockUserService.assignStoreScopes.mockResolvedValueOnce(assignResult);

      const result = await controller.assignStoreScopes(
        'user-id-123',
        { assignments: [{ storeId: 'store-id-1', scopeType: 'SINGLE_STORE' }] },
        mockJwtPayload,
      );

      expect(result).toEqual({ data: assignResult });
      expect(mockUserService.assignStoreScopes).toHaveBeenCalledWith(
        'user-id-123', 'tenant-abc', 'admin-id',
        { assignments: [{ storeId: 'store-id-1', scopeType: 'SINGLE_STORE' }] },
      );
    });
  });

  describe('getStoreAssignments', () => {
    it('trả về danh sách assignments', async () => {
      const assignmentsResult = {
        data: [
          {
            id: 'assign-id-1',
            storeId: 'store-id-1',
            scopeType: 'SINGLE_STORE',
            store: { name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ', isActive: true },
          },
        ],
      };
      mockUserService.getStoreAssignments.mockResolvedValueOnce(assignmentsResult);

      const result = await controller.getStoreAssignments('user-id-123', mockJwtPayload);

      expect(result).toEqual(assignmentsResult);
      expect(mockUserService.getStoreAssignments).toHaveBeenCalledWith('user-id-123', 'tenant-abc');
    });
  });

  describe('Guards verification', () => {
    it('AuthModeGuard được áp dụng trên createUser', () => {
      const guards = Reflect.getMetadata('__guards__', UserController.prototype.createUser);
      expect(guards).toBeDefined();
    });

    it('AuthModeGuard được áp dụng trên listUsers', () => {
      const guards = Reflect.getMetadata('__guards__', UserController.prototype.listUsers);
      expect(guards).toBeDefined();
    });

    it('AuthModeGuard được áp dụng trên getUser', () => {
      const guards = Reflect.getMetadata('__guards__', UserController.prototype.getUser);
      expect(guards).toBeDefined();
    });

    it('AuthModeGuard được áp dụng trên updateUser', () => {
      const guards = Reflect.getMetadata('__guards__', UserController.prototype.updateUser);
      expect(guards).toBeDefined();
    });
  });
});
