import { IsString, Matches } from 'class-validator';

export class SetPinDto {
  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'PIN phải là 4-8 chữ số' })
  pin!: string;
}
