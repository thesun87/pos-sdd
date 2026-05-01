import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';

export class ResetPinDto {
  @ApiProperty()
  @IsUUID('all')
  userId!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'PIN mới phải là 4-8 chữ số' })
  newPin!: string;
}
