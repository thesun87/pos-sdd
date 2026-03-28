import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../types/jwt-payload.js';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from '../../modules/database/database.service.js';
import { generateId } from '@pos-sdd/shared';

interface RequestWithUser extends Request {
  user?: JwtPayload;
  needsApproval?: boolean;
}

/**
 * ApprovalGuard - Skeleton implementation (Story 1.5).
 *
 * DESIGN NOTE (IG-1 — deferred):
 * LimitGuard hiện tại throw ForbiddenException khi vượt limit, do đó
 * request không bao giờ đến ApprovalGuard. Handoff mechanism (LimitGuard
 * set request.needsApproval flag thay vì throw) sẽ được implement cùng
 * với full approval flow trong Payment/Order epics.
 *
 * Hiện tại guard này luôn pass through (request.needsApproval = undefined = falsy).
 * Full flow: PIN input UI, approval token generation, approver role verification.
 */
@Injectable()
export class ApprovalGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Nếu action không cần approval (hoặc LimitGuard chưa set flag) → cho qua
    // TODO(Payment epic): LimitGuard cần set request.needsApproval = true thay vì throw
    if (!request.needsApproval) return true;

    const approvalToken = request.headers['x-approval-token'] as string | undefined;

    // Cần approval nhưng không có token → reject
    if (!approvalToken) {
      throw new ForbiddenException({
        message: 'Cần approval token để thực hiện hành động này',
        needsApproval: true,
      });
    }

    // Validate approval token — dùng secret riêng, KHÔNG dùng chung với auth JWT
    const secret = process.env['APPROVAL_JWT_SECRET'] ?? process.env['AUTH_JWT_SECRET'];
    if (!secret) throw new Error('APPROVAL_JWT_SECRET is not set');

    try {
      const payload = jwt.verify(approvalToken, secret) as {
        approverId: string;
        approverRole: string;
        action: string;
        tenantId: string;
      };

      const user = request.user;

      // Verify approver còn active trong DB (tránh dùng token từ user đã bị deactivate)
      if (user) {
        const approver = await this.db.user.findFirst({
          where: { id: payload.approverId, tenant_id: user.tenantId, is_active: true },
          select: { id: true },
        });
        if (!approver) {
          throw new ForbiddenException('Approver không còn active trong hệ thống');
        }

        await this.db.auditLog.create({
          data: {
            id: generateId(),
            tenant_id: user.tenantId,
            user_id: user.userId,
            action: 'APPROVE',
            resource: 'approval',
            resource_id: user.userId,
            metadata: {
              requester: user.userId,
              approver: payload.approverId,
              approver_role: payload.approverRole,
              approved_action: payload.action,
            },
          },
        });
      }

      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new ForbiddenException('Approval token không hợp lệ hoặc đã hết hạn');
    }
  }
}
