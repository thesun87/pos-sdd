import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { JwtPayload } from '../types/jwt-payload.js';
import { CHECK_POLICY_KEY } from '../decorators/check-policy.decorator.js';
import type { PolicyCheck } from '../decorators/check-policy.decorator.js';

interface PolicyRecord {
  id: string;
  role: string;
  action: string;
  resource: string;
  limit: unknown;
  override_role: string | null;
  is_active: boolean;
}

interface RequestWithPolicies extends Request {
  user?: JwtPayload;
  policies?: PolicyRecord[];
  body: Record<string, unknown>;
}

@Injectable()
export class LimitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const policyCheck = this.reflector.getAllAndOverride<PolicyCheck | undefined>(CHECK_POLICY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Không có @CheckPolicy() → cho qua
    if (!policyCheck) return true;

    const request = context.switchToHttp().getRequest<RequestWithPolicies>();
    const user = request.user;
    const policies = request.policies ?? [];

    if (!user) throw new ForbiddenException('Unauthorized');

    // Tìm policy matching cho user's roles
    const matchingPolicy = policies.find(
      (p) => user.roles.includes(p.role) && p.action === policyCheck.action && p.resource === policyCheck.resource,
    );

    // Không có policy → deny by default
    if (!matchingPolicy) {
      throw new ForbiddenException({
        message: 'Action không được phép',
        needsApproval: false,
      });
    }

    // limit = null → unlimited, cho qua
    if (matchingPolicy.limit == null) return true;

    const currentLimit = Number(matchingPolicy.limit);
    const amount = request.body?.['amount'] as number | undefined;
    const percentage = request.body?.['percentage'] as number | undefined;
    const value = amount ?? percentage;

    // Nếu không có amount/percentage trong body → cho qua (không check)
    if (value === undefined) return true;

    if (value <= currentLimit) return true;

    throw new ForbiddenException({
      message: 'Vượt quá giới hạn cho phép',
      needsApproval: true,
      currentLimit,
      requiredOverrideRole: matchingPolicy.override_role,
    });
  }
}
