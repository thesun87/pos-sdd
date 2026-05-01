import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemDetailErrorDto {
  @ApiProperty({ description: 'Tên field bị lỗi (nếu có)' })
  field!: string;

  @ApiProperty({ description: 'Chi tiết lỗi' })
  message!: string;
}

export class ProblemDetailDto {
  @ApiProperty({ example: 'https://pos-sdd.com/errors/validation-failed', description: 'URI mô tả loại lỗi' })
  type!: string;

  @ApiProperty({ example: 'Validation Failed', description: 'Tiêu đề lỗi ngắn gọn' })
  title!: string;

  @ApiProperty({ example: 422, description: 'HTTP Status Code' })
  status!: number;

  @ApiProperty({ example: 'Dữ liệu đầu vào không hợp lệ', description: 'Chi tiết lỗi cụ thể' })
  detail!: string;

  @ApiProperty({ example: 'VALIDATION_FAILED', description: 'Mã lỗi hệ thống' })
  errorCode!: string;

  @ApiProperty({ example: '2026-05-01T15:00:00+07:00', description: 'Thời gian xảy ra lỗi' })
  timestamp!: string;

  @ApiPropertyOptional({ example: '/api/v1/auth/sign-in', description: 'URI endpoint xảy ra lỗi' })
  instance?: string;

  @ApiPropertyOptional({ type: [ProblemDetailErrorDto], description: 'Danh sách chi tiết lỗi validation (nếu có)' })
  errors?: ProblemDetailErrorDto[];
}
