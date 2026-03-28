import { Module } from '@nestjs/common';
import { RoleController } from './role.controller.js';
import { RoleService } from './role.service.js';
import { PolicyLoaderInterceptor } from '../../common/interceptors/policy-loader.interceptor.js';
import { AuthNestModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthNestModule],
  controllers: [RoleController],
  providers: [RoleService, PolicyLoaderInterceptor],
  exports: [RoleService],
})
export class RoleModule {}
