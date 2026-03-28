import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';
import { generateId } from '@pos-sdd/shared';
import type { CreateRoleDto } from './dto/create-role.dto.js';
import type { UpdateRoleDto } from './dto/update-role.dto.js';
import type { ListRolesQueryDto } from './dto/list-roles-query.dto.js';

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Record<string, unknown>;
  usersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDetailResponse extends RoleResponse {
  policies: Array<{
    id: string;
    action: string;
    resource: string;
    limit: number | null;
    overrideRole: string | null;
    isActive: boolean;
  }>;
}

export interface PaginatedRolesResponse {
  data: RoleResponse[];
  meta: { page: number; limit: number; total: number };
}

@Injectable()
export class RoleService {
  constructor(private readonly db: DatabaseService) {}

  async listRoles(tenantId: string, query: ListRolesQueryDto): Promise<PaginatedRolesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = { tenant_id: tenantId };
    const andFilters: Record<string, unknown>[] = [];

    if (query.isSystem !== undefined) {
      andFilters.push({ is_system: query.isSystem });
    }

    if (query.search) {
      andFilters.push({ name: { contains: query.search, mode: 'insensitive' } });
    }

    if (andFilters.length > 0) {
      where['AND'] = andFilters;
    }

    const [roles, total] = await Promise.all([
      this.db.role.findMany({
        where,
        include: { _count: { select: { user_roles: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'asc' },
      }),
      this.db.role.count({ where }),
    ]);

    return {
      data: roles.map((r) => this._mapRoleResponse(r)),
      meta: { page, limit, total },
    };
  }

  async getRoleById(roleId: string, tenantId: string): Promise<RoleDetailResponse> {
    const role = await this.db.role.findFirst({
      where: { id: roleId, tenant_id: tenantId },
      include: { _count: { select: { user_roles: true } } },
    });

    if (!role) throw new NotFoundException('Không tìm thấy vai trò');

    const policies = await this.db.policy.findMany({
      where: { tenant_id: tenantId, role: role.name },
    });

    return {
      ...this._mapRoleResponse(role),
      policies: policies.map((p) => ({
        id: p.id,
        action: p.action,
        resource: p.resource,
        limit: p.limit ? Number(p.limit) : null,
        overrideRole: p.override_role,
        isActive: p.is_active,
      })),
    };
  }

  async createRole(tenantId: string, dto: CreateRoleDto, adminUserId: string): Promise<RoleResponse> {
    const roleId = generateId();
    const role = await this.db.$transaction(async (tx) => {
      const existing = await tx.role.findFirst({
        where: { tenant_id: tenantId, name: dto.name },
      });
      if (existing) {
        throw new ConflictException('Tên vai trò đã tồn tại trong tenant này');
      }

      const created = await tx.role.create({
        data: {
          id: roleId,
          tenant_id: tenantId,
          name: dto.name,
          description: dto.description ?? null,
          is_system: false,
          permissions: (dto.permissions ?? {}) as Prisma.InputJsonValue,
        },
        include: { _count: { select: { user_roles: true } } },
      });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'CREATE',
          resource: 'role',
          resource_id: roleId,
          new_data: { name: dto.name, permissions: (dto.permissions ?? {}) as Prisma.InputJsonValue },
        },
      });

      return created;
    });

    return this._mapRoleResponse(role);
  }

  async updateRole(roleId: string, tenantId: string, dto: UpdateRoleDto, adminUserId: string): Promise<RoleResponse> {
    const role = await this.db.role.findFirst({
      where: { id: roleId, tenant_id: tenantId },
    });
    if (!role) throw new NotFoundException('Không tìm thấy vai trò');
    if (role.is_system) throw new ForbiddenException('Không thể chỉnh sửa vai trò hệ thống');

    const oldData = { name: role.name, description: role.description, permissions: role.permissions };

    const updated = await this.db.$transaction(async (tx) => {
      if (dto.name && dto.name !== role.name) {
        const nameConflict = await tx.role.findFirst({
          where: { tenant_id: tenantId, name: dto.name },
        });
        if (nameConflict) throw new ConflictException('Tên vai trò đã tồn tại trong tenant này');
      }

      const result = await tx.role.update({
        where: { id: roleId, tenant_id: tenantId },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.permissions !== undefined && { permissions: dto.permissions as Prisma.InputJsonValue }),
        },
        include: { _count: { select: { user_roles: true } } },
      });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'role',
          resource_id: roleId,
          old_data: oldData as Prisma.InputJsonValue,
          new_data: { name: result.name, description: result.description } as Prisma.InputJsonValue,
        },
      });

      return result;
    });

    return this._mapRoleResponse(updated);
  }

  async deleteRole(roleId: string, tenantId: string, adminUserId: string): Promise<{ success: true }> {
    const role = await this.db.role.findFirst({
      where: { id: roleId, tenant_id: tenantId },
      include: { _count: { select: { user_roles: true } } },
    });
    if (!role) throw new NotFoundException('Không tìm thấy vai trò');
    if (role.is_system) throw new ForbiddenException('Không thể xóa vai trò hệ thống');

    if (role._count.user_roles > 0) {
      throw new ConflictException('Không thể xóa vai trò đang được gán cho người dùng');
    }

    await this.db.$transaction(async (tx) => {
      await tx.role.delete({ where: { id: roleId, tenant_id: tenantId } });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'DELETE',
          resource: 'role',
          resource_id: roleId,
          old_data: { name: role.name } as Prisma.InputJsonValue,
        },
      });
    });

    return { success: true };
  }

  private _mapRoleResponse(role: {
    id: string;
    name: string;
    description: string | null;
    is_system: boolean;
    permissions: unknown;
    created_at: Date;
    updated_at: Date;
    _count: { user_roles: number };
  }): RoleResponse {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.is_system,
      permissions: (role.permissions as Record<string, unknown>) ?? {},
      usersCount: role._count.user_roles,
      createdAt: role.created_at,
      updatedAt: role.updated_at,
    };
  }
}
