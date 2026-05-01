import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthModeGuard } from '../../common/guards/auth-mode.guard.js';
import { PolicyLoaderInterceptor } from '../../common/interceptors/policy-loader.interceptor.js';
import { RoleGuard } from '../../common/guards/role.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.js';
import { PolicyService } from './policy.service.js';
import { CreatePolicyDto } from './dto/create-policy.dto.js';
import { UpdatePolicyDto } from './dto/update-policy.dto.js';
import { ListPoliciesQueryDto } from './dto/list-policies-query.dto.js';

@ApiTags('Policies')
@Controller('policies')
@UseInterceptors(PolicyLoaderInterceptor)
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  @UseGuards(AuthModeGuard)
  async listPolicies(
    @Query() query: ListPoliciesQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.policyService.listPolicies(user.tenantId, query);
  }

  @Post()
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.CREATED)
  async createPolicy(
    @Body() dto: CreatePolicyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.policyService.createPolicy(user.tenantId, dto, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Patch :id' })
  @Patch(':id')
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  async updatePolicy(
    @Param('id') id: string,
    @Body() dto: UpdatePolicyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.policyService.updatePolicy(id, user.tenantId, dto, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Delete :id' })
  @Delete(':id')
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.OK)
  async deletePolicy(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.policyService.deletePolicy(id, user.tenantId, user.userId);
    return { data: result };
  }
}
