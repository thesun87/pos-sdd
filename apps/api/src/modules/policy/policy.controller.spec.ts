import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolicyController } from './policy.controller.js';

const mockPolicyService = {
  listPolicies: vi.fn(),
  createPolicy: vi.fn(),
  updatePolicy: vi.fn(),
  deletePolicy: vi.fn(),
};

const mockUser = {
  userId: 'admin-id',
  tenantId: 'tenant-abc',
  roles: ['chain_owner'],
  storeAssignments: [],
};

const mockPolicy = {
  id: 'policy-id-1',
  tenantId: 'tenant-abc',
  storeId: null,
  role: 'cashier',
  action: 'discount',
  resource: 'order',
  limit: 10,
  overrideRole: 'shift_lead',
  conditions: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PolicyController', () => {
  let controller: PolicyController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PolicyController(mockPolicyService as unknown as import('./policy.service.js').PolicyService);
  });

  it('listPolicies trả về paginated response', async () => {
    const paginatedResult = { data: [mockPolicy], meta: { page: 1, limit: 20, total: 1 } };
    mockPolicyService.listPolicies.mockResolvedValue(paginatedResult);

    const result = await controller.listPolicies({}, mockUser);

    expect(result).toEqual(paginatedResult);
  });

  it('createPolicy trả về { data: policy }', async () => {
    mockPolicyService.createPolicy.mockResolvedValue(mockPolicy);

    const dto = { role: 'cashier', action: 'discount', resource: 'order', limit: 10 };
    const result = await controller.createPolicy(dto, mockUser);

    expect(result).toEqual({ data: mockPolicy });
    expect(mockPolicyService.createPolicy).toHaveBeenCalledWith('tenant-abc', dto, 'admin-id');
  });

  it('updatePolicy trả về { data: policy }', async () => {
    mockPolicyService.updatePolicy.mockResolvedValue(mockPolicy);

    const result = await controller.updatePolicy('policy-id-1', { limit: 20 }, mockUser);

    expect(result).toEqual({ data: mockPolicy });
    expect(mockPolicyService.updatePolicy).toHaveBeenCalledWith('policy-id-1', 'tenant-abc', { limit: 20 }, 'admin-id');
  });

  it('deletePolicy trả về { data: { success: true } }', async () => {
    mockPolicyService.deletePolicy.mockResolvedValue({ success: true });

    const result = await controller.deletePolicy('policy-id-1', mockUser);

    expect(result).toEqual({ data: { success: true } });
  });
});
