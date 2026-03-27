import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard.js';
import { AuthModeGuard } from '../../common/guards/auth-mode.guard.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionAuthGuard, AuthModeGuard],
  exports: [AuthService, SessionAuthGuard, AuthModeGuard],
})
export class AuthNestModule {}
