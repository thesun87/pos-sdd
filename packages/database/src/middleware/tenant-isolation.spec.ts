import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// Unit tests for tenant isolation middleware logic
// We test the behavior of tenant_id injection WITHOUT a real
// database by passing a mock base PrismaClient.
// ============================================================

// Mock @prisma/client before importing the module
vi.mock('@prisma/client', () => {
  const mockExtend = vi.fn();
  const MockPrismaClient = vi.fn().mockImplementation(() => ({
    $extends: mockExtend,
  }));
  return { PrismaClient: MockPrismaClient };
});

function buildMockBase() {
  let capturedExtension: Record<string, unknown> | null = null;
  const mockBase = {
    $extends: vi.fn((ext: Record<string, unknown>) => {
      capturedExtension = ext;
      return mockBase;
    }),
  };
  return {
    mockBase,
    getInterceptors: () => {
      const allModels = (capturedExtension as unknown as Record<string, Record<string, Record<string, unknown>>>)
        ?.query?.$allModels;
      return allModels as Record<
        string,
        (ctx: { model: string; args: Record<string, unknown>; query: (a: Record<string, unknown>) => Promise<unknown> }) => Promise<unknown>
      >;
    },
  };
}

describe('createTenantPrismaClient', () => {
  const TENANT_ID = 'tenant-uuid-v7-test';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws if tenantId is empty', async () => {
    const { createTenantPrismaClient } = await import('./tenant-isolation.js');
    const { PrismaClient } = await import('@prisma/client');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fakeBase = new (PrismaClient as any)();
    expect(() => createTenantPrismaClient(fakeBase, '')).toThrow('tenantId is required');
  });

  describe('tenant_id injection logic', () => {
    it('injects tenant_id in findMany where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue([]);

      await interceptors.findMany({ model: 'Store', args: { where: { is_active: true } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { is_active: true, tenant_id: TENANT_ID } });
    });

    it('does NOT inject tenant_id for Tenant model (excluded)', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue([]);

      await interceptors.findMany({ model: 'Tenant', args: { where: { is_active: true } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { is_active: true } });
    });

    it('does NOT inject tenant_id for UserStoreAssignment model (excluded)', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue([]);

      await interceptors.findMany({ model: 'UserStoreAssignment', args: { where: { user_id: 'u1' } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { user_id: 'u1' } });
    });

    it('injects tenant_id in findFirst where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue(null);

      await interceptors.findFirst({ model: 'User', args: { where: { email: 'test@example.com' } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { email: 'test@example.com', tenant_id: TENANT_ID } });
    });

    it('injects tenant_id in findFirstOrThrow where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({ id: '1' });

      await interceptors.findFirstOrThrow({ model: 'User', args: { where: { id: 'u1' } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { id: 'u1', tenant_id: TENANT_ID } });
    });

    it('injects tenant_id in findUnique where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({ id: '1' });

      await interceptors.findUnique({ model: 'Store', args: { where: { id: 'store-1' } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { id: 'store-1', tenant_id: TENANT_ID } });
    });

    it('injects tenant_id in count where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue(5);

      await interceptors.count({ model: 'User', args: { where: { is_active: true } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { is_active: true, tenant_id: TENANT_ID } });
    });

    it('injects tenant_id in aggregate where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({});

      await interceptors.aggregate({ model: 'Policy', args: { where: { is_active: true } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { is_active: true, tenant_id: TENANT_ID } });
    });

    it('injects tenant_id in create data', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({ id: '1' });

      await interceptors.create({ model: 'Store', args: { data: { name: 'Store 1' } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ data: { name: 'Store 1', tenant_id: TENANT_ID } });
    });

    it('injects tenant_id in createMany data array', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({ count: 2 });

      await interceptors.createMany({
        model: 'Store',
        args: { data: [{ name: 'S1' }, { name: 'S2' }] },
        query: mockQuery,
      });

      expect(mockQuery).toHaveBeenCalledWith({
        data: [
          { name: 'S1', tenant_id: TENANT_ID },
          { name: 'S2', tenant_id: TENANT_ID },
        ],
      });
    });

    it('injects tenant_id in update where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({ id: '1' });

      await interceptors.update({ model: 'Store', args: { where: { id: 'store-1' }, data: { name: 'Updated' } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { id: 'store-1', tenant_id: TENANT_ID }, data: { name: 'Updated' } });
    });

    it('injects tenant_id in updateMany where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({ count: 2 });

      await interceptors.updateMany({ model: 'Store', args: { where: { is_active: true }, data: { is_active: false } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { is_active: true, tenant_id: TENANT_ID }, data: { is_active: false } });
    });

    it('injects tenant_id in delete where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({ id: '1' });

      await interceptors.delete({ model: 'Store', args: { where: { id: 'store-1' } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { id: 'store-1', tenant_id: TENANT_ID } });
    });

    it('injects tenant_id in deleteMany where clause', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn().mockResolvedValue({ count: 3 });

      await interceptors.deleteMany({ model: 'Store', args: { where: { is_active: false } }, query: mockQuery });

      expect(mockQuery).toHaveBeenCalledWith({ where: { is_active: false, tenant_id: TENANT_ID } });
    });

    it('blocks update on AuditLog (append-only)', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn();

      await expect(
        interceptors.update({ model: 'AuditLog', args: { where: { id: 'log-1' }, data: { action: 'CREATE' } }, query: mockQuery }),
      ).rejects.toThrow('Update operation is not allowed on AuditLog');
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('blocks updateMany on AuditLog (append-only)', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn();

      await expect(
        interceptors.updateMany({ model: 'AuditLog', args: { where: {}, data: {} }, query: mockQuery }),
      ).rejects.toThrow('UpdateMany operation is not allowed on AuditLog');
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('blocks delete on AuditLog (append-only)', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn();

      await expect(
        interceptors.delete({ model: 'AuditLog', args: { where: { id: 'log-1' } }, query: mockQuery }),
      ).rejects.toThrow('Delete operation is not allowed on AuditLog');
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('blocks deleteMany on AuditLog (append-only)', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const { mockBase, getInterceptors } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(mockBase as any, TENANT_ID);
      const interceptors = getInterceptors();
      const mockQuery = vi.fn();

      await expect(
        interceptors.deleteMany({ model: 'AuditLog', args: { where: { tenant_id: TENANT_ID } }, query: mockQuery }),
      ).rejects.toThrow('DeleteMany operation is not allowed on AuditLog');
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('different tenants get different tenant_id injected', async () => {
      const { createTenantPrismaClient } = await import('./tenant-isolation.js');
      const TENANT_A = 'tenant-a-uuid';
      const TENANT_B = 'tenant-b-uuid';

      const { mockBase: baseA, getInterceptors: getIntA } = buildMockBase();
      const { mockBase: baseB, getInterceptors: getIntB } = buildMockBase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(baseA as any, TENANT_A);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTenantPrismaClient(baseB as any, TENANT_B);

      const mockQA = vi.fn().mockResolvedValue([]);
      const mockQB = vi.fn().mockResolvedValue([]);

      await getIntA().findMany({ model: 'Store', args: { where: {} }, query: mockQA });
      await getIntB().findMany({ model: 'Store', args: { where: {} }, query: mockQB });

      expect(mockQA).toHaveBeenCalledWith({ where: { tenant_id: TENANT_A } });
      expect(mockQB).toHaveBeenCalledWith({ where: { tenant_id: TENANT_B } });
    });
  });
});
