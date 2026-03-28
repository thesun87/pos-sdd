import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';
import { generateId } from '@pos-sdd/shared';
import { invalidatePolicyCache } from '../../common/interceptors/policy-loader.interceptor.js';
import type { CreatePolicyDto } from './dto/create-policy.dto.js';
import type { UpdatePolicyDto } from './dto/update-policy.dto.js';
import type { ListPoliciesQueryDto } from './dto/list-policies-query.dto.js';

export interface PolicyResponse {
  id: string;
  tenantId: string;
  storeId: string | null;
  role: string;
  action: string;
  resource: string;
  limit: number | null;
  overrideRole: string | null;
  conditions: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPoliciesResponse {
  data: PolicyResponse[];
  meta: { page: number; limit: number; total: number };
}

@Injectable()
export class PolicyService {
  constructor(private readonly db: DatabaseService) {}

  async listPolicies(tenantId: string, query: ListPoliciesQueryDto): Promise<PaginatedPoliciesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = { tenant_id: tenantId };
    const andFilters: Record<string, unknown>[] = [];

    if (query.role) andFilters.push({ role: query.role });
    if (query.action) andFilters.push({ action: query.action });
    if (query.resource) andFilters.push({ resource: query.resource });
    if (query.storeId) andFilters.push({ store_id: query.storeId });
    if (query.isActive !== undefined) andFilters.push({ is_active: query.isActive });

    if (andFilters.length > 0) where['AND'] = andFilters;

    const [policies, total] = await Promise.all([
      this.db.policy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'asc' },
      }),
      this.db.policy.count({ where }),
    ]);

    return {
      data: policies.map((p) => this._mapPolicyResponse(p)),
      meta: { page, limit, total },
    };
  }

  async createPolicy(tenantId: string, dto: CreatePolicyDto, adminUserId: string): Promise<PolicyResponse> {
    const policyId = generateId();
    const policy = await this.db.$transaction(async (tx) => {
      // Validate role tồn tại trong tenant
      const role = await tx.role.findFirst({
        where: { tenant_id: tenantId, name: dto.role },
      });
      if (!role) {
        throw new BadRequestException(`Vai trò '${dto.role}' không tồn tại trong tenant này`);
      }

      // Validate override_role tồn tại trong tenant (nếu có)
      if (dto.overrideRole) {
        const overrideRoleExists = await tx.role.findFirst({
          where: { tenant_id: tenantId, name: dto.overrideRole },
        });
        if (!overrideRoleExists) {
          throw new BadRequestException(`Override role '${dto.overrideRole}' không tồn tại trong tenant này`);
        }
      }

      // Validate unique constraint: [tenant_id, role, action, resource, store_id]
      const existing = await tx.policy.findFirst({
        where: {
          tenant_id: tenantId,
          role: dto.role,
          action: dto.action,
          resource: dto.resource,
          store_id: dto.storeId ?? null,
        },
      });
      if (existing) {
        throw new ConflictException('Policy cho role, action, resource và store này đã tồn tại');
      }

      const created = await tx.policy.create({
        data: {
          id: policyId,
          tenant_id: tenantId,
          store_id: dto.storeId ?? null,
          role: dto.role,
          action: dto.action,
          resource: dto.resource,
          limit: dto.limit ?? null,
          override_role: dto.overrideRole ?? null,
          conditions: dto.conditions != null ? (dto.conditions as Prisma.InputJsonValue) : Prisma.DbNull,
          is_active: dto.isActive ?? true,
        },
      });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'CREATE',
          resource: 'policy',
          resource_id: policyId,
          new_data: { role: dto.role, action: dto.action, resource: dto.resource, limit: dto.limit },
        },
      });

      return created;
    });

    invalidatePolicyCache(tenantId);
    return this._mapPolicyResponse(policy);
  }

  async updatePolicy(policyId: string, tenantId: string, dto: UpdatePolicyDto, adminUserId: string): Promise<PolicyResponse> {
    const policy = await this.db.policy.findFirst({
      where: { id: policyId, tenant_id: tenantId },
    });
    if (!policy) throw new NotFoundException('Không tìm thấy policy');

    const oldData = {
      limit: policy.limit ? Number(policy.limit) : null,
      override_role: policy.override_role,
      conditions: policy.conditions,
      is_active: policy.is_active,
    };

    const updated = await this.db.$transaction(async (tx) => {
      const result = await tx.policy.update({
        where: { id: policyId, tenant_id: tenantId },
        data: {
          ...(dto.limit !== undefined && { limit: dto.limit }),
          ...(dto.overrideRole !== undefined && { override_role: dto.overrideRole }),
          ...(dto.conditions !== undefined && { conditions: dto.conditions != null ? (dto.conditions as Prisma.InputJsonValue) : Prisma.DbNull }),
          ...(dto.isActive !== undefined && { is_active: dto.isActive }),
        },
      });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'UPDATE',
          resource: 'policy',
          resource_id: policyId,
          old_data: oldData as Prisma.InputJsonValue,
          new_data: { limit: dto.limit, override_role: dto.overrideRole, is_active: dto.isActive } as Prisma.InputJsonValue,
        },
      });

      return result;
    });

    invalidatePolicyCache(tenantId);
    return this._mapPolicyResponse(updated);
  }

  async deletePolicy(policyId: string, tenantId: string, adminUserId: string): Promise<{ success: true }> {
    const policy = await this.db.policy.findFirst({
      where: { id: policyId, tenant_id: tenantId },
    });
    if (!policy) throw new NotFoundException('Không tìm thấy policy');

    await this.db.$transaction(async (tx) => {
      await tx.policy.delete({ where: { id: policyId, tenant_id: tenantId } });

      await tx.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: adminUserId,
          action: 'DELETE',
          resource: 'policy',
          resource_id: policyId,
          old_data: { role: policy.role, action: policy.action, resource: policy.resource },
        },
      });
    });

    invalidatePolicyCache(tenantId);
    return { success: true };
  }

  private _mapPolicyResponse(policy: {
    id: string;
    tenant_id: string;
    store_id: string | null;
    role: string;
    action: string;
    resource: string;
    limit: unknown;
    override_role: string | null;
    conditions: unknown;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): PolicyResponse {
    return {
      id: policy.id,
      tenantId: policy.tenant_id,
      storeId: policy.store_id,
      role: policy.role,
      action: policy.action,
      resource: policy.resource,
      limit: policy.limit != null ? Number(policy.limit) : null,
      overrideRole: policy.override_role,
      conditions: (policy.conditions as Record<string, unknown> | null) ?? null,
      isActive: policy.is_active,
      createdAt: policy.created_at,
      updatedAt: policy.updated_at,
    };
  }
}
