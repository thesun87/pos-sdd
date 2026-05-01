import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StoreAssignmentItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty()
  @IsEnum(['SINGLE_STORE', 'STORE_GROUP', 'ALL_STORES'])
  scopeType!: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
}

export class AssignStoreDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreAssignmentItemDto)
  @ApiProperty()
  assignments!: StoreAssignmentItemDto[];
}
