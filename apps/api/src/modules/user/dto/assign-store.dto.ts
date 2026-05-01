import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StoreAssignmentItemDto {
  @IsOptional()
  @IsString()
  storeId?: string;

  @IsEnum(['SINGLE_STORE', 'STORE_GROUP', 'ALL_STORES'])
  scopeType!: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
}

export class AssignStoreDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreAssignmentItemDto)
  assignments!: StoreAssignmentItemDto[];
}
