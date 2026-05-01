import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from '../database/database.service.js';
import type { PinLoginResponseDto } from './dto/pin-login-response.dto.js';
import type { JwtPayload } from '../../common/types/jwt-payload.js';
import type { SessionWithUser } from '@pos-sdd/database';
import { generateId, hashPin, verifyPin } from '@pos-sdd/shared';

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = 'session_token';

function getSessionExpiryDays(): number {
  const raw = process.env['SESSION_EXPIRES_IN'] ?? '7d';
  const match = /^(\d+)d$/.exec(raw);
  return match ? parseInt(match[1], 10) : 7;
}

export function getSessionMaxAgeMs(): number {
  return getSessionExpiryDays() * 24 * 60 * 60 * 1000;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export { SESSION_COOKIE_NAME };

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================================
  // SIGN UP
  // ============================================================
  async signUp(
    email: string,
    password: string,
    name: string,
    tenantId: string,
  ): Promise<{ id: string; email: string; name: string }> {
    // Kiểm tra tenant tồn tại và active
    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, is_active: true },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant không tồn tại');
    }

    if (!tenant.is_active) {
      throw new BadRequestException('Tenant không hoạt động');
    }

    // Kiểm tra email đã tồn tại trong tenant chưa
    const existing = await this.db.user.findUnique({
      where: { tenant_id_email: { tenant_id: tenantId, email } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email đã được đăng ký');
    }

    // DTO validation đã cover password requirements — không cần validate lại ở đây

    const userId = generateId();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Tạo User và Account trong một transaction
    const user = await this.db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: userId,
          tenant_id: tenantId,
          email,
          name,
          is_active: true,
        },
      });

      await tx.account.create({
        data: {
          id: generateId(),
          userId: newUser.id,
          accountId: email,
          providerId: 'credential',
          password: passwordHash,
        },
      });

      return newUser;
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  // ============================================================
  // SIGN IN (email/password) — trả về session token
  // ============================================================
  async signIn(
    email: string,
    password: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    // Kiểm tra tenant tồn tại và active
    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, is_active: true },
    });

    if (!tenant) {
      await this._logFailedLogin(tenantId, email, 'tenant_not_found');
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!tenant.is_active) {
      await this._logFailedLogin(tenantId, email, 'tenant_inactive');
      throw new UnauthorizedException('Tenant không hoạt động');
    }

    const account = await this.db.account.findFirst({
      where: {
        user: { email, tenant_id: tenantId },
        providerId: 'credential',
      },
      include: {
        user: true,
      },
    });

    if (!account?.password || !(await bcrypt.compare(password, account.password))) {
      await this._logFailedLogin(tenantId, email, account ? 'invalid_password' : 'account_not_found');
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!account.user.is_active) {
      await this._logFailedLogin(tenantId, email, 'user_inactive');
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    const token = randomBytes(32).toString('hex');
    const expiryDays = getSessionExpiryDays();

    await this.db.session.create({
      data: {
        id: generateId(),
        token,
        userId: account.userId,
        expiresAt: addDays(new Date(), expiryDays),
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      },
    });

    await this.db.auditLog.create({
      data: {
        id: generateId(),
        tenant_id: tenantId,
        user_id: account.userId,
        action: 'LOGIN',
        resource: 'session',
        metadata: { method: 'email_password' },
      },
    });

    return token;
  }

  // ============================================================
  // GET SESSION — lấy session kèm user info
  // ============================================================
  async getSession(token: string): Promise<SessionWithUser | null> {
    const session = await this.db.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            user_roles: {
              include: { role: true },
            },
            store_assignments: true,
          },
        },
      },
    });

    if (!session) return null;

    // Kiểm tra session còn hạn không
    if (session.expiresAt < new Date()) {
      // Xóa session hết hạn
      await this.db.session.delete({ where: { token } }).catch(() => null);
      return null;
    }

    if (!session.user.is_active) return null;

    return session as SessionWithUser;
  }

  // ============================================================
  // SIGN OUT
  // ============================================================
  async signOut(token: string): Promise<void> {
    const session = await this.db.session.findUnique({
      where: { token },
      select: { userId: true, user: { select: { tenant_id: true } } },
    });

    if (!session) return; // Idempotent — không throw lỗi

    // Wrap session deletion and audit log in try-catch to ensure session is deleted even if audit fails
    await this.db.session.delete({ where: { token } });

    try {
      await this.db.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: session.user.tenant_id,
          user_id: session.userId,
          action: 'LOGOUT',
          resource: 'session',
        },
      });
    } catch (error) {
      // Best-effort audit logging — don't fail signOut if audit log fails
      console.error('[AUTH] Failed to write LOGOUT audit log:', error);
    }
  }

  // ============================================================
  // PIN LOGIN — trả về JWT (cho POS offline)
  // ============================================================
  async pinLogin(pin: string, tenantSlug: string, email: string): Promise<PinLoginResponseDto> {
    const tenant = await this.db.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, is_active: true },
    });

    if (!tenant || !tenant.is_active) {
      throw new UnauthorizedException('Tenant không tồn tại hoặc không hoạt động');
    }

    const user = await this.db.user.findUnique({
      where: { tenant_id_email: { tenant_id: tenant.id, email } },
      include: {
        user_roles: {
          include: { role: { select: { name: true } } },
        },
        store_assignments: {
          select: { store_id: true, scope_type: true },
        },
      },
    });

    if (!user) {
      this._logFailedLogin(tenant.id, email, 'user_not_found');
      throw new UnauthorizedException('Email hoặc PIN không đúng');
    }

    if (!user.is_active) {
      this._logFailedLogin(tenant.id, email, 'user_inactive');
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    if (!user.pin_hash) {
      throw new BadRequestException('PIN chưa được thiết lập. Vui lòng liên hệ quản lý.');
    }

    const isValidPin = await verifyPin(pin, user.pin_hash);
    if (!isValidPin) {
      this._logFailedLogin(tenant.id, email, 'invalid_pin');
      throw new UnauthorizedException('Email hoặc PIN không đúng');
    }

    const roles = user.user_roles.map((ur) => ur.role.name);
    const storeAssignments = user.store_assignments.map((sa) => ({
      storeId: sa.store_id,
      scopeType: sa.scope_type as 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES',
    }));

    const secret = process.env['AUTH_JWT_SECRET'];
    if (!secret) throw new Error('AUTH_JWT_SECRET is not set');

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      tenantId: tenant.id,
      roles,
      storeAssignments,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    await this.db.auditLog.create({
      data: {
        id: generateId(),
        tenant_id: tenant.id,
        user_id: user.id,
        action: 'LOGIN',
        resource: 'session',
        metadata: { method: 'pin' },
      },
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
        storeAssignments,
      },
    };
  }

  // ============================================================
  // SET PIN (user tự đặt)
  // ============================================================
  async setPinForUser(userId: string, pin: string, tenantId: string): Promise<{ success: true }> {
    const pinHash = await hashPin(pin);

    await this.db.user.update({
      where: { id: userId },
      data: { pin_hash: pinHash },
    });

    await this.db.auditLog.create({
      data: {
        id: generateId(),
        tenant_id: tenantId,
        user_id: userId,
        action: 'UPDATE',
        resource: 'user_pin',
        resource_id: userId,
      },
    });

    return { success: true };
  }

  // ============================================================
  // RESET PIN (admin đặt lại cho user khác)
  // ============================================================
  async resetPinForUser(
    adminUserId: string,
    adminTenantId: string,
    targetUserId: string,
    newPin: string,
  ): Promise<{ success: true }> {
    // Kiểm tra admin có role phù hợp
    const adminUser = await this.db.user.findUnique({
      where: { id: adminUserId },
      select: {
        user_roles: {
          include: { role: { select: { name: true } } },
        },
      },
    });

    const adminRoles = adminUser?.user_roles.map((ur) => ur.role.name) ?? [];
    const authorizedRoles = ['system_admin', 'chain_owner', 'store_manager'];
    const hasAuthorization = adminRoles.some((role) => authorizedRoles.includes(role));

    if (!hasAuthorization) {
      throw new ForbiddenException(
        'Chỉ system_admin, chain_owner hoặc store_manager mới có quyền reset PIN',
      );
    }

    const targetUser = await this.db.user.findUnique({
      where: { id: targetUserId },
      select: { tenant_id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (targetUser.tenant_id !== adminTenantId) {
      throw new ForbiddenException('Không có quyền thực hiện thao tác này');
    }

    const pinHash = await hashPin(newPin);

    await this.db.user.update({
      where: { id: targetUserId },
      data: { pin_hash: pinHash },
    });

    await this.db.auditLog.create({
      data: {
        id: generateId(),
        tenant_id: adminTenantId,
        user_id: adminUserId,
        action: 'UPDATE',
        resource: 'user_pin',
        resource_id: targetUserId,
        metadata: { reset_by: adminUserId },
      },
    });

    return { success: true };
  }

  private async _logFailedLogin(tenantId: string, email: string, reason: string): Promise<void> {
    console.warn(`[AUTH] Failed login attempt: reason=${reason} email=${email} tenant=${tenantId}`);

    // Ghi audit log vào DB
    try {
      await this.db.auditLog.create({
        data: {
          id: generateId(),
          tenant_id: tenantId,
          user_id: '00000000-0000-0000-0000-000000000000', // System user for failed attempts
          action: 'LOGIN',
          resource: 'session',
          metadata: {
            success: false,
            reason,
            email,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      // Best-effort logging — don't fail the request if audit log fails
      console.error('[AUTH] Failed to write audit log:', error);
    }
  }
}
