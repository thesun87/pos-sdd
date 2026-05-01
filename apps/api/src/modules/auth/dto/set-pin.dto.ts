import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class SetPinDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'PIN phải là 4-8 chữ số' })
  pin!: string;
}
