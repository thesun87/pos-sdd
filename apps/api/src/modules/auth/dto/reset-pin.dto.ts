import { IsString, IsUUID, Matches } from 'class-validator';

export class ResetPinDto {
  @IsUUID('all')
  userId!: string;

  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'PIN mới phải là 4-8 chữ số' })
  newPin!: string;
}
