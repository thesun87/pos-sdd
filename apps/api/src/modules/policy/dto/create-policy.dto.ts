import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, Min } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  role!: string;

  @IsString()
  action!: string;

  @IsString()
  resource!: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  limit?: number;

  @IsOptional()
  @IsString()
  overrideRole?: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
