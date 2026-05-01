import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreController } from './store.controller.js';

const mockStoreService = {
  listStores: vi.fn(),
  getStoreById: vi.fn(),
  createStore: vi.fn(),
  updateStore: vi.fn(),
  deactivateStore: vi.fn(),
};

const mockUser = {
  userId: 'admin-id',
  tenantId: 'tenant-abc',
  roles: ['chain_owner'],
  storeAssignments: [],
};

const mockStore = {
  id: 'store-id-1',
  name: 'Chi nhánh Quận 1',
  address: '123 Nguyễn Huệ',
  phone: '028-1234-5678',
  isActive: true,
  userCount: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('StoreController', () => {
  let controller: StoreController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new StoreController(mockStoreService as unknown as import('./store.service.js').StoreService);
  });

  it('listStores trả về paginated response', async () => {
    const paginatedResult = { data: [mockStore], meta: { page: 1, limit: 20, total: 1 } };
    mockStoreService.listStores.mockResolvedValue(paginatedResult);

    const result = await controller.listStores({}, mockUser);

    expect(result).toEqual(paginatedResult);
    expect(mockStoreService.listStores).toHaveBeenCalledWith('tenant-abc', {});
  });

  it('getStoreById trả về { data: store }', async () => {
    mockStoreService.getStoreById.mockResolvedValue(mockStore);

    const result = await controller.getStoreById('store-id-1', mockUser);

    expect(result).toEqual({ data: mockStore });
    expect(mockStoreService.getStoreById).toHaveBeenCalledWith('store-id-1', 'tenant-abc');
  });

  it('createStore trả về { data: store }', async () => {
    mockStoreService.createStore.mockResolvedValue(mockStore);

    const result = await controller.createStore({ name: 'Chi nhánh Quận 1' }, mockUser);

    expect(result).toEqual({ data: mockStore });
    expect(mockStoreService.createStore).toHaveBeenCalledWith('tenant-abc', { name: 'Chi nhánh Quận 1' }, 'admin-id');
  });

  it('updateStore trả về { data: store }', async () => {
    const updated = { ...mockStore, name: 'Updated Name' };
    mockStoreService.updateStore.mockResolvedValue(updated);

    const result = await controller.updateStore('store-id-1', { name: 'Updated Name' }, mockUser);

    expect(result).toEqual({ data: updated });
    expect(mockStoreService.updateStore).toHaveBeenCalledWith('store-id-1', 'tenant-abc', { name: 'Updated Name' }, 'admin-id');
  });

  it('deactivateStore trả về { data: store }', async () => {
    const deactivated = { ...mockStore, isActive: false };
    mockStoreService.deactivateStore.mockResolvedValue(deactivated);

    const result = await controller.deactivateStore('store-id-1', mockUser);

    expect(result).toEqual({ data: deactivated });
    expect(mockStoreService.deactivateStore).toHaveBeenCalledWith('store-id-1', 'tenant-abc', 'admin-id');
  });
});
