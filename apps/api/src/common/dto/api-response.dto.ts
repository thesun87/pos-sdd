import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;
}

export class ApiResponseDto<T> {
  @ApiProperty()
  data!: T;

  @ApiPropertyOptional({ type: PaginationMetaDto })
  meta?: PaginationMetaDto;
}
