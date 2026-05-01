import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { AuthModeGuard } from '../../common/guards/auth-mode.guard.js';
import { RoleGuard } from '../../common/guards/role.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.js';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { AssignStoreDto } from './dto/assign-store.dto.js';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthModeGuard)
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.createUser(user.tenantId, dto, user.userId);
    return { data: result };
  }

  @Get()
  @UseGuards(AuthModeGuard)
  async listUsers(
    @Query() query: ListUsersQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.listUsers(user.tenantId, query);
  }

  @ApiOperation({ summary: 'Get :id' })
  @Get(':id')
  @UseGuards(AuthModeGuard)
  async getUser(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.getUserById(id, user.tenantId);
    if (!result) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return { data: result };
  }

  @ApiOperation({ summary: 'Patch :id' })
  @Patch(':id')
  @UseGuards(AuthModeGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.updateUser(id, user.tenantId, dto, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Post :id/deactivate' })
  @Post(':id/deactivate')
  @UseGuards(AuthModeGuard)
  @HttpCode(HttpStatus.OK)
  async deactivateUser(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.deactivateUser(id, user.tenantId, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Post :id/activate' })
  @Post(':id/activate')
  @UseGuards(AuthModeGuard)
  @HttpCode(HttpStatus.OK)
  async activateUser(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.activateUser(id, user.tenantId, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Post :id/roles' })
  @Post(':id/roles')
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.OK)
  async assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.assignRoles(id, user.tenantId, user.userId, dto);
    return { data: result };
  }

  @ApiOperation({ summary: 'Post :id/store-assignments' })
  @Post(':id/store-assignments')
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.OK)
  async assignStoreScopes(
    @Param('id') id: string,
    @Body() dto: AssignStoreDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.userService.assignStoreScopes(id, user.tenantId, user.userId, dto);
    return { data: result };
  }

  @ApiOperation({ summary: 'Get :id/store-assignments' })
  @Get(':id/store-assignments')
  @UseGuards(AuthModeGuard)
  async getStoreAssignments(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.getStoreAssignments(id, user.tenantId);
  }
}
