import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, Min } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  role!: string;

  @ApiProperty()
  @IsString()
  action!: string;

  @ApiProperty()
  @IsString()
  resource!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  overrideRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
