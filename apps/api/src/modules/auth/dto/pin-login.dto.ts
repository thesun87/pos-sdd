import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class PinLoginDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'PIN phải là 4-8 chữ số' })
  pin!: string;

  @ApiProperty()
  @IsString()
  tenantSlug!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;
}
