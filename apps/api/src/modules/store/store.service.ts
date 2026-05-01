import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';
import { generateId } from '@pos-sdd/shared';
import type { CreateStoreDto } from './dto/create-store.dto.js';
import type { UpdateStoreDto } from './dto/update-store.dto.js';
import type { ListStoresQueryDto } from './dto/list-stores-query.dto.js';

export interface StoreResponse {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedStoresResponse {
  data: StoreResponse[];
  meta: { page: number; limit: number; total: number };
}

@Injectable()
export class StoreService {
  constructor(private readonly db: DatabaseService) {}

  async listStores(tenantId: string, query: ListStoresQueryDto): Promise<PaginatedStoresResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = { tenant_id: tenantId };
    const andFilters: Record<string, unknown>[] = [];

    if (query.isActive !== undefined) {
      andFilters.push({ is_active: query.isActive });
    }

    if (query.search) {
      andFilters.push({
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { address: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    if (andFilters.length > 0) {
      where['AND'] = andFilters;
    }

    const [stores, total] = await Promise.all([
      this.db.store.findMany({
        where,
        include: { _count: { select: { user_assignments: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'asc' },
      }),
      this.db.store.count({ where }),
    ]);

    return {
      data: stores.map((s) => this._mapStoreResponse(s)),
      meta: { page, limit, total },
    };
  }

  async getStoreById(storeId: string, tenantId: string): Promise<StoreResponse> {
    const store = await this.db.store.findFirst({
      where: { id: storeId, tenant_id: tenantId },
      include: { _count: { select: { user_assignments: true } } },
    });

    if (!store) throw new NotFoundException('Không tìm thấy cửa hàng');

    return this._mapStoreResponse(store);
  }

  async createStore(tenantId: string, dto: CreateStoreDto, adminUserId: string): Promise<StoreResponse> {
    const storeId = generateId();

    const store = await this.db.$transaction(async (tx) => {
      const existing = await tx.store.findFirst({
        where: { tenant_id: tenantId, name: dto.name },
      });
      if (existing) {
        throw new ConflictException('Tên cửa hàng đã tồn tại trong tenant này');
      }

      const created = await tx.store.create({
        data: {
          id: storeId,
          tenant_id: tenantId,
          name: dto.name,
          address: dto.address ?? null,
          phone: dto.phone ?? null,
          settings: {} as Prisma.InputJsonValue,
        },
        include: { _count: { select: { user_assignments: true } } },
      });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'CREATE',
          resource: 'store',
          resource_id: storeId,
          new_data: { name: dto.name, address: dto.address ?? null, phone: dto.phone ?? null } as Prisma.InputJsonValue,
        },
      });

      return created;
    });

    return this._mapStoreResponse(store);
  }

  async updateStore(
    storeId: string,
    tenantId: string,
    dto: UpdateStoreDto,
    adminUserId: string,
  ): Promise<StoreResponse> {
    const updated = await this.db.$transaction(async (tx) => {
      const store = await tx.store.findFirst({
        where: { id: storeId, tenant_id: tenantId },
      });
      if (!store) throw new NotFoundException('Không tìm thấy cửa hàng');

      const oldData = { name: store.name, address: store.address, phone: store.phone };

      if (dto.name !== undefined && dto.name !== store.name) {
        const nameConflict = await tx.store.findFirst({
          where: { tenant_id: tenantId, name: dto.name },
        });
        if (nameConflict) throw new ConflictException('Tên cửa hàng đã tồn tại trong tenant này');
      }

      const result = await tx.store.update({
        where: { id: storeId, tenant_id: tenantId },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
        },
        include: { _count: { select: { user_assignments: true } } },
      });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'store',
          resource_id: storeId,
          old_data: oldData as Prisma.InputJsonValue,
          new_data: { name: result.name, address: result.address, phone: result.phone } as Prisma.InputJsonValue,
        },
      });

      return result;
    });

    return this._mapStoreResponse(updated);
  }

  async deactivateStore(storeId: string, tenantId: string, adminUserId: string): Promise<StoreResponse> {
    const updated = await this.db.$transaction(async (tx) => {
      const store = await tx.store.findFirst({
        where: { id: storeId, tenant_id: tenantId },
        include: { _count: { select: { user_assignments: true } } },
      });
      if (!store) throw new NotFoundException('Không tìm thấy cửa hàng');

      const assignmentCount = store._count.user_assignments;

      const result = await tx.store.update({
        where: { id: storeId, tenant_id: tenantId },
        data: { is_active: false },
        include: { _count: { select: { user_assignments: true } } },
      });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'store',
          resource_id: storeId,
          old_data: { is_active: store.is_active } as Prisma.InputJsonValue,
          new_data: { is_active: false } as Prisma.InputJsonValue,
          metadata: { deactivated_by: adminUserId, active_assignment_count: assignmentCount } as Prisma.InputJsonValue,
        },
      });

      return result;
    });

    return this._mapStoreResponse(updated);
  }

  private _mapStoreResponse(store: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    _count: { user_assignments: number };
  }): StoreResponse {
    return {
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      isActive: store.is_active,
      userCount: store._count.user_assignments,
      createdAt: store.created_at,
      updatedAt: store.updated_at,
    };
  }
}
