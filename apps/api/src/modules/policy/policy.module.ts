import { Module } from '@nestjs/common';
import { PolicyController } from './policy.controller.js';
import { PolicyService } from './policy.service.js';
import { PolicyLoaderInterceptor } from '../../common/interceptors/policy-loader.interceptor.js';
import { AuthNestModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthNestModule],
  controllers: [PolicyController],
  providers: [PolicyService, PolicyLoaderInterceptor],
  exports: [PolicyService],
})
export class PolicyModule {}
