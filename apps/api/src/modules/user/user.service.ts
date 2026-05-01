import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { hashPin } from '@pos-sdd/shared';
import { generateId } from '@pos-sdd/shared';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import type { AssignRolesDto } from './dto/assign-roles.dto.js';
import type { AssignStoreDto } from './dto/assign-store.dto.js';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  hasPIN: boolean;
  tenantId: string;
  roles: Array<{ id: string; name: string }>;
  storeAssignments: Array<{
    id: string;
    storeId: string | null;
    scopeType: string;
    store: { id: string; name: string } | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedUsersResponse {
  data: UserResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  // P-1: thêm adminUserId param
  async createUser(tenantId: string, dto: CreateUserDto, adminUserId: string): Promise<UserResponse> {
    // Deduplicate roleIds trước khi validate (P-9)
    const uniqueRoleIds = [...new Set(dto.roleIds)];

    const pinHash = dto.pin ? await hashPin(dto.pin) : null;
    const userId = generateId();

    // P-2: email check + user create + audit log đều trong transaction
    await this.db.$transaction(async (tx) => {
      // 1. Validate email unique trong tenant (trong transaction)
      const existing = await tx.user.findUnique({
        where: { tenant_id_email: { tenant_id: tenantId, email: dto.email } },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException('Email đã được sử dụng trong tenant này');
      }

      // 2. Validate roleIds tồn tại và thuộc cùng tenant
      const roles = await tx.role.findMany({
        where: { id: { in: uniqueRoleIds }, tenant_id: tenantId },
        select: { id: true },
      });
      if (roles.length !== uniqueRoleIds.length) {
        throw new BadRequestException('Một hoặc nhiều roleId không hợp lệ hoặc không thuộc tenant này');
      }

      // 3. Tạo user
      const newUser = await tx.user.create({
        data: {
          id: userId,
          tenant_id: tenantId,
          email: dto.email,
          name: dto.name,
          pin_hash: pinHash,
          is_active: true,
        },
      });

      if (uniqueRoleIds.length > 0) {
        await tx.userRole.createMany({
          data: uniqueRoleIds.map((roleId) => ({
            id: generateId(),
            user_id: newUser.id,
            role_id: roleId,
          })),
        });
      }

      // 4. Ghi audit log trong cùng transaction (P-4), dùng adminUserId (P-1)
      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'CREATE',
          resource: 'user',
          resource_id: userId,
          new_data: { name: dto.name, email: dto.email, roles: uniqueRoleIds },
        },
      });
    });

    // 5. Trả về user với roles (P-10: throw nếu null thay vì cast)
    const result = await this.getUserById(userId, tenantId);
    if (!result) {
      throw new InternalServerErrorException('Không thể lấy thông tin user sau khi tạo');
    }
    return result;
  }

  async updateUser(
    userId: string,
    tenantId: string,
    dto: UpdateUserDto,
    adminUserId: string,
  ): Promise<UserResponse> {
    // P-2: toàn bộ logic trong transaction
    await this.db.$transaction(async (tx) => {
      // 1. Tìm user theo id + tenant_id
      const user = await tx.user.findFirst({
        where: { id: userId, tenant_id: tenantId },
        select: { id: true, name: true, email: true, is_active: true },
      });
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      // 2. Nếu update email — validate email unique trong tenant
      if (dto.email && dto.email !== user.email) {
        const emailConflict = await tx.user.findUnique({
          where: { tenant_id_email: { tenant_id: tenantId, email: dto.email } },
          select: { id: true },
        });
        if (emailConflict) {
          throw new ConflictException('Email đã được sử dụng trong tenant này');
        }
      }

      const oldData = { name: user.name, email: user.email };

      // 3. Update user — P-3: thêm tenant_id vào WHERE
      await tx.user.update({
        where: { id: userId, tenant_id: tenantId },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.email !== undefined && { email: dto.email }),
        },
      });

      // 4. Ghi audit log trong cùng transaction (P-4)
      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'user',
          resource_id: userId,
          old_data: oldData,
          new_data: { name: dto.name ?? user.name, email: dto.email ?? user.email },
        },
      });
    });

    // P-10: throw nếu null thay vì cast
    const result = await this.getUserById(userId, tenantId);
    if (!result) {
      throw new InternalServerErrorException('Không thể lấy thông tin user sau khi cập nhật');
    }
    return result;
  }

  async deactivateUser(
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<{ success: true }> {
    // KHÔNG cho deactivate chính mình — check trước khi DB call
    if (userId === adminUserId) {
      throw new BadRequestException('Không thể vô hiệu hóa tài khoản của chính mình');
    }

    // P-5: toàn bộ operations trong transaction
    await this.db.$transaction(async (tx) => {
      // 1. Tìm user theo id + tenant_id
      const user = await tx.user.findFirst({
        where: { id: userId, tenant_id: tenantId },
        select: { id: true, is_active: true },
      });
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      // 2. Update is_active = false — P-3: thêm tenant_id vào WHERE
      await tx.user.update({
        where: { id: userId, tenant_id: tenantId },
        data: { is_active: false },
      });

      // 3. Xóa tất cả sessions của user
      await tx.session.deleteMany({ where: { userId } });

      // 4. Ghi audit log trong cùng transaction — P-6: thêm old_data/new_data
      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'user',
          resource_id: userId,
          old_data: { is_active: user.is_active },
          new_data: { is_active: false },
          metadata: { deactivated_by: adminUserId },
        },
      });
    });

    return { success: true };
  }

  async activateUser(
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<{ success: true }> {
    // P-5: toàn bộ operations trong transaction
    await this.db.$transaction(async (tx) => {
      // 1. Tìm user theo id + tenant_id
      const user = await tx.user.findFirst({
        where: { id: userId, tenant_id: tenantId },
        select: { id: true, is_active: true },
      });
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      // 2. Update is_active = true — P-3: thêm tenant_id vào WHERE
      await tx.user.update({
        where: { id: userId, tenant_id: tenantId },
        data: { is_active: true },
      });

      // 3. Ghi audit log trong cùng transaction — P-6: thêm old_data/new_data
      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'user',
          resource_id: userId,
          old_data: { is_active: user.is_active },
          new_data: { is_active: true },
          metadata: { activated_by: adminUserId },
        },
      });
    });

    return { success: true };
  }

  async getUserById(userId: string, tenantId: string): Promise<UserResponse | null> {
    const user = await this.db.user.findFirst({
      where: { id: userId, tenant_id: tenantId },
      include: {
        user_roles: {
          include: { role: true },
        },
        store_assignments: {
          include: { store: true },
        },
      },
    });

    if (!user) return null;

    return this._mapUserResponse(user);
  }

  async listUsers(tenantId: string, query: ListUsersQueryDto): Promise<PaginatedUsersResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // Build where clause
    const where: Record<string, unknown> = { tenant_id: tenantId };
    const andFilters: Record<string, unknown>[] = [];

    if (query.search) {
      andFilters.push({
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    if (query.roleId) {
      andFilters.push({ user_roles: { some: { role_id: query.roleId } } });
    }

    if (query.isActive !== undefined) {
      andFilters.push({ is_active: query.isActive });
    }

    if (andFilters.length > 0) {
      where['AND'] = andFilters;
    }

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: {
          user_roles: { include: { role: true } },
          store_assignments: { include: { store: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data: users.map((u) => this._mapUserResponse(u)),
      meta: { page, limit, total },
    };
  }

  async assignRoles(
    userId: string,
    tenantId: string,
    adminUserId: string,
    dto: AssignRolesDto,
  ): Promise<{ userId: string; roles: Array<{ id: string; name: string }> }> {
    const uniqueRoleIds = [...new Set(dto.roleIds)];

    await this.db.$transaction(async (tx) => {
      // 1. Validate user tồn tại và cùng tenant
      const user = await tx.user.findFirst({
        where: { id: userId, tenant_id: tenantId },
        select: { id: true },
      });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng');

      // 2. Validate tất cả roleIds tồn tại và cùng tenant
      const roles = await tx.role.findMany({
        where: { id: { in: uniqueRoleIds }, tenant_id: tenantId },
        select: { id: true },
      });
      if (roles.length !== uniqueRoleIds.length) {
        throw new BadRequestException('Một hoặc nhiều roleId không hợp lệ hoặc không thuộc tenant này');
      }

      // 3. Lấy old_roles để audit log
      const oldUserRoles = await tx.userRole.findMany({
        where: { user_id: userId },
        select: { role_id: true },
      });
      const oldRoleIds = oldUserRoles.map((ur: { role_id: string }) => ur.role_id);

      // 4. Transaction: delete tất cả user_roles cũ → createMany user_roles mới
      await tx.userRole.deleteMany({ where: { user_id: userId } });
      await tx.userRole.createMany({
        data: uniqueRoleIds.map((roleId) => ({
          id: generateId(),
          user_id: userId,
          role_id: roleId,
        })),
      });

      // 5. Ghi audit log
      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'user_role',
          resource_id: userId,
          old_data: { roles: oldRoleIds },
          new_data: { roles: uniqueRoleIds },
          metadata: { old_roles: oldRoleIds, new_roles: uniqueRoleIds },
        },
      });
    });

    // Lấy roles mới để trả về
    const updatedUserRoles = await this.db.userRole.findMany({
      where: { user_id: userId },
      include: { role: { select: { id: true, name: true } } },
    });

    return {
      userId,
      roles: updatedUserRoles.map((ur: { role: { id: string; name: string } }) => ur.role),
    };
  }

  async assignStoreScopes(
    userId: string,
    tenantId: string,
    adminUserId: string,
    dto: AssignStoreDto,
  ): Promise<{ userId: string; assignments: Array<{ storeId: string | null; scopeType: string }> }> {
    await this.db.$transaction(async (tx) => {
      // 1. Validate user tồn tại và cùng tenant
      const user = await tx.user.findFirst({
        where: { id: userId, tenant_id: tenantId },
        select: { id: true },
      });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng');

      // 2. Validate ALL_STORES: chỉ cho phép 1 và phải exclusive
      const allStoresAssignments = dto.assignments.filter((a) => a.scopeType === 'ALL_STORES');
      if (allStoresAssignments.length > 1) {
        throw new BadRequestException('Chỉ được phép 1 assignment với scopeType ALL_STORES');
      }
      if (allStoresAssignments.length === 1 && dto.assignments.length > 1) {
        throw new BadRequestException('ALL_STORES phải là assignment duy nhất, không được kết hợp với SINGLE_STORE hoặc STORE_GROUP');
      }

      // 3. Validate SINGLE_STORE/STORE_GROUP phải có storeId và tồn tại trong tenant
      const nonAllStoresAssignments = dto.assignments.filter((a) => a.scopeType !== 'ALL_STORES');
      for (const a of nonAllStoresAssignments) {
        if (!a.storeId) {
          throw new BadRequestException(`scopeType ${a.scopeType} yêu cầu storeId`);
        }
      }

      const nonAllStoresIds = nonAllStoresAssignments.map((a) => a.storeId as string);

      // 4. Deduplicate storeId trong SINGLE_STORE/STORE_GROUP
      const seen = new Set<string>();
      for (const id of nonAllStoresIds) {
        if (seen.has(id)) {
          throw new BadRequestException(`Trùng lặp storeId: ${id}`);
        }
        seen.add(id);
      }

      if (nonAllStoresIds.length > 0) {
        const stores = await tx.store.findMany({
          where: { id: { in: nonAllStoresIds }, tenant_id: tenantId },
          select: { id: true },
        });
        if (stores.length !== nonAllStoresIds.length) {
          throw new BadRequestException('Một hoặc nhiều storeId không hợp lệ hoặc không thuộc tenant này');
        }
      }

      // 6. Lấy old assignments để audit log
      const oldAssignments = await tx.userStoreAssignment.findMany({
        where: { user_id: userId },
        select: { store_id: true, scope_type: true },
      });

      // 7. Delete tất cả assignments cũ → createMany mới
      await tx.userStoreAssignment.deleteMany({ where: { user_id: userId } });

      if (dto.assignments.length > 0) {
        await tx.userStoreAssignment.createMany({
          data: dto.assignments.map((a) => ({
            id: generateId(),
            user_id: userId,
            store_id: a.storeId ?? null,
            scope_type: a.scopeType,
          })),
        });
      }

      // 8. Ghi audit log
      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'user_store_assignment',
          resource_id: userId,
          old_data: { assignments: oldAssignments.map((a: { store_id: string | null; scope_type: string }) => ({ storeId: a.store_id, scopeType: a.scope_type })) },
          new_data: { assignments: dto.assignments.map((a) => ({ storeId: a.storeId, scopeType: a.scopeType })) },
          metadata: {
            old_assignments: oldAssignments.map((a: { store_id: string | null; scope_type: string }) => ({ storeId: a.store_id, scopeType: a.scope_type })),
            new_assignments: dto.assignments.map((a) => ({ storeId: a.storeId, scopeType: a.scopeType })),
          },
        },
      });
    });

    // Lấy assignments mới để trả về
    const updatedAssignments = await this.db.userStoreAssignment.findMany({
      where: { user_id: userId },
      select: { store_id: true, scope_type: true },
    });

    return {
      userId,
      assignments: updatedAssignments.map((a: { store_id: string | null; scope_type: string }) => ({
        storeId: a.store_id,
        scopeType: a.scope_type,
      })),
    };
  }

  async getStoreAssignments(
    userId: string,
    tenantId: string,
  ): Promise<{ data: Array<{ id: string; storeId: string | null; scopeType: string; store: { name: string; address: string | null; isActive: boolean } | null }> }> {
    // Validate user tồn tại và cùng tenant để đảm bảo tenant isolation
    const user = await this.db.user.findFirst({
      where: { id: userId, tenant_id: tenantId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const assignments = await this.db.userStoreAssignment.findMany({
      where: { user_id: userId },
      include: { store: { select: { id: true, name: true, address: true, is_active: true } } },
    });

    return {
      data: assignments.map((a: { id: string; store_id: string | null; scope_type: string; store: { id: string; name: string; address: string | null; is_active: boolean } | null }) => ({
        id: a.id,
        storeId: a.store_id,
        scopeType: a.scope_type,
        store: a.store
          ? { name: a.store.name, address: a.store.address, isActive: a.store.is_active }
          : null,
      })),
    };
  }

  private _mapUserResponse(user: {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    pin_hash: string | null;
    tenant_id: string;
    createdAt: Date;
    updatedAt: Date;
    user_roles: Array<{ role: { id: string; name: string } }>;
    store_assignments: Array<{
      id: string;
      store_id: string | null;
      scope_type: string;
      store: { id: string; name: string } | null;
    }>;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.is_active,
      hasPIN: !!user.pin_hash,
      tenantId: user.tenant_id,
      roles: user.user_roles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
      storeAssignments: user.store_assignments.map((sa) => ({
        id: sa.id,
        storeId: sa.store_id,
        scopeType: sa.scope_type,
        store: sa.store ? { id: sa.store.id, name: sa.store.name } : null,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
