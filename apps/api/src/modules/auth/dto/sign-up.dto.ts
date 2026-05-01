import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsUUID } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Mật khẩu phải có chữ hoa, chữ thường và số',
  })
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Tên không được để trống' })
  name!: string;

  @ApiProperty()
  @IsUUID('all', { message: 'tenantId không hợp lệ' })
  tenantId!: string;
}
