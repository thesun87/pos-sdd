import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Mật khẩu không được để trống' })
  password!: string;

  @IsUUID('all', { message: 'tenantId không hợp lệ' })
  tenantId!: string;
}
