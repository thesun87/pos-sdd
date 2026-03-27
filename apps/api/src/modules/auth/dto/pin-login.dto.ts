import { IsEmail, IsString, Matches } from 'class-validator';

export class PinLoginDto {
  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'PIN phải là 4-8 chữ số' })
  pin!: string;

  @IsString()
  tenantSlug!: string;

  @IsEmail()
  email!: string;
}
