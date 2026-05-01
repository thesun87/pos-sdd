import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthModeGuard } from '../../common/guards/auth-mode.guard.js';
import { RoleGuard } from '../../common/guards/role.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.js';
import { StoreService } from './store.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';
import { ListStoresQueryDto } from './dto/list-stores-query.dto.js';

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @UseGuards(AuthModeGuard)
  async listStores(
    @Query() query: ListStoresQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.storeService.listStores(user.tenantId, query);
  }

  @ApiOperation({ summary: 'Get :id' })
  @Get(':id')
  @UseGuards(AuthModeGuard)
  async getStoreById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.storeService.getStoreById(id, user.tenantId);
    return { data: result };
  }

  @Post()
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.CREATED)
  async createStore(
    @Body() dto: CreateStoreDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.storeService.createStore(user.tenantId, dto, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Patch :id' })
  @Patch(':id')
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  async updateStore(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.storeService.updateStore(id, user.tenantId, dto, user.userId);
    return { data: result };
  }

  @ApiOperation({ summary: 'Post :id/deactivate' })
  @Post(':id/deactivate')
  @UseGuards(AuthModeGuard, RoleGuard)
  @Roles('chain_owner', 'system_admin')
  @HttpCode(HttpStatus.OK)
  async deactivateStore(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.storeService.deactivateStore(id, user.tenantId, user.userId);
    return { data: result };
  }
}
