import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { UserRole, Role, UserStoreAssignment } from '@prisma/client';
import { AuthService, SESSION_COOKIE_NAME, getSessionMaxAgeMs } from './auth.service.js';
import { PinLoginDto } from './dto/pin-login.dto.js';
import { SignUpDto } from './dto/sign-up.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SetPinDto } from './dto/set-pin.dto.js';
import { ResetPinDto } from './dto/reset-pin.dto.js';
import type { PinLoginResponseDto } from './dto/pin-login-response.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AuthModeGuard } from '../../common/guards/auth-mode.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ──────────────── SIGN UP ────────────────
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() dto: SignUpDto,
  ): Promise<{ id: string; email: string; name: string }> {
    return this.authService.signUp(dto.email, dto.password, dto.name, dto.tenantId);
  }

  // ──────────────── SIGN IN ────────────────
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const token = await this.authService.signIn(
      dto.email,
      dto.password,
      dto.tenantId,
      req.ip,
      req.headers['user-agent'],
    );

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: getSessionMaxAgeMs(),
      path: '/',
    });

    return { success: true };
  }

  // ──────────────── GET SESSION ────────────────
  @Get('session')
  async getSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      tenantId: string;
      roles: string[];
      storeAssignments: { storeId: string | null; scopeType: string }[];
    };
  }> {
    const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Chưa đăng nhập');
    }

    const session = await this.authService.getSession(token);
    if (!session) {
      res.clearCookie(SESSION_COOKIE_NAME);
      throw new UnauthorizedException('Session không hợp lệ hoặc đã hết hạn');
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        tenantId: session.user.tenant_id,
        roles: session.user.user_roles.map((ur: UserRole & { role: Role }) => ur.role.name),
        storeAssignments: session.user.store_assignments.map((sa: UserStoreAssignment) => ({
          storeId: sa.store_id,
          scopeType: sa.scope_type,
        })),
      },
    };
  }

  // ──────────────── SIGN OUT ────────────────
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (token) {
      await this.authService.signOut(token);
    }
    res.clearCookie(SESSION_COOKIE_NAME);
    return { success: true };
  }

  // ──────────────── PIN LOGIN ────────────────
  @Post('pin-login')
  @HttpCode(HttpStatus.OK)
  async pinLogin(@Body() dto: PinLoginDto): Promise<PinLoginResponseDto> {
    return this.authService.pinLogin(dto.pin, dto.tenantSlug, dto.email);
  }

  // ──────────────── SET PIN ────────────────
  @Post('set-pin')
  @UseGuards(AuthModeGuard)
  @HttpCode(HttpStatus.OK)
  async setPin(
    @Body() dto: SetPinDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true }> {
    return this.authService.setPinForUser(user.userId, dto.pin, user.tenantId);
  }

  // ──────────────── RESET PIN (admin only) ────────────────
  @Post('reset-pin')
  @UseGuards(AuthModeGuard)
  @HttpCode(HttpStatus.OK)
  async resetPin(
    @Body() dto: ResetPinDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true }> {
    return this.authService.resetPinForUser(user.userId, user.tenantId, dto.userId, dto.newPin);
  }
}
