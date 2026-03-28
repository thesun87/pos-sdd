import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000) // P-12: prevent unbounded skip
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(100) // P-11: prevent perf attack via long search string
  search?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
