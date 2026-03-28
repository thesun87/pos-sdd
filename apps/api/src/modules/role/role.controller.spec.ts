import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleController } from './role.controller.js';

const mockRoleService = {
  listRoles: vi.fn(),
  getRoleById: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
};

const mockUser = {
  userId: 'admin-id',
  tenantId: 'tenant-abc',
  roles: ['chain_owner'],
  storeAssignments: [],
};

const mockRole = {
  id: 'role-id-1',
  name: 'custom_role',
  description: null,
  isSystem: false,
  permissions: {},
  usersCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RoleController', () => {
  let controller: RoleController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new RoleController(mockRoleService as unknown as import('./role.service.js').RoleService);
  });

  it('listRoles trả về paginated response', async () => {
    const paginatedResult = { data: [mockRole], meta: { page: 1, limit: 20, total: 1 } };
    mockRoleService.listRoles.mockResolvedValue(paginatedResult);

    const result = await controller.listRoles({}, mockUser);

    expect(result).toEqual(paginatedResult);
    expect(mockRoleService.listRoles).toHaveBeenCalledWith('tenant-abc', {});
  });

  it('getRoleById trả về { data: role }', async () => {
    const roleDetail = { ...mockRole, policies: [] };
    mockRoleService.getRoleById.mockResolvedValue(roleDetail);

    const result = await controller.getRoleById('role-id-1', mockUser);

    expect(result).toEqual({ data: roleDetail });
    expect(mockRoleService.getRoleById).toHaveBeenCalledWith('role-id-1', 'tenant-abc');
  });

  it('createRole trả về { data: role }', async () => {
    mockRoleService.createRole.mockResolvedValue(mockRole);

    const result = await controller.createRole({ name: 'custom_role' }, mockUser);

    expect(result).toEqual({ data: mockRole });
    expect(mockRoleService.createRole).toHaveBeenCalledWith('tenant-abc', { name: 'custom_role' }, 'admin-id');
  });

  it('updateRole trả về { data: role }', async () => {
    mockRoleService.updateRole.mockResolvedValue(mockRole);

    const result = await controller.updateRole('role-id-1', { name: 'updated' }, mockUser);

    expect(result).toEqual({ data: mockRole });
    expect(mockRoleService.updateRole).toHaveBeenCalledWith('role-id-1', 'tenant-abc', { name: 'updated' }, 'admin-id');
  });

  it('deleteRole trả về { data: { success: true } }', async () => {
    mockRoleService.deleteRole.mockResolvedValue({ success: true });

    const result = await controller.deleteRole('role-id-1', mockUser);

    expect(result).toEqual({ data: { success: true } });
  });
});
