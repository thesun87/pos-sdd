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
import { RoleService } from './role.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { ListRolesQueryDto } from './dto/list-roles-query.dto.js';

@ApiTags('Roles')
@Controller('roles')
@UseInterceptors(PolicyLoaderInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(AuthModeGuard)
  async listRoles(
    @Query() query: ListRolesQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roleService.listRoles(user.tenantId, query);
  }

  @ApiOperation({ summary: 'Get :id' })
  @Get(':id')
  @UseGuards(AuthModeGuard)
  async getRoleById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.roleService.getRoleById(id, user.tenantId);
    return { data: result };
  }

  @Post()
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.roleService.createRole(user.tenantId, dto, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Patch :id' })
  @Patch(':id')
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.roleService.updateRole(id, user.tenantId, dto, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Delete :id' })
  @Delete(':id')
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.OK)
  async deleteRole(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.roleService.deleteRole(id, user.tenantId, user.userId);
    return { data: result };
  }
}
