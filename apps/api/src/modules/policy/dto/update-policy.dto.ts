import { IsOptional, IsBoolean, IsNumber, IsObject, IsString, Min } from 'class-validator';

export class UpdatePolicyDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  limit?: number | null;

  @IsOptional()
  @IsString()
  overrideRole?: string | null;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown> | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
