import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Mật khẩu không được để trống' })
  password!: string;

  @ApiProperty()
  @IsUUID('all', { message: 'tenantId không hợp lệ' })
  tenantId!: string;
}
