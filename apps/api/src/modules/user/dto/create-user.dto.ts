import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  Matches,
  IsUUID,
  ArrayMinSize,
  ArrayUnique,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @Matches(/^\d{4,6}$/, { message: 'PIN phải là 4-6 chữ số' })
  pin?: string;

  // P-7: ArrayMinSize(1), P-8: IsUUID, P-9: ArrayUnique
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 vai trò' })
  @ArrayUnique({ message: 'Danh sách vai trò không được trùng lặp' })
  @IsUUID('all', { each: true, message: 'Mỗi roleId phải là UUID hợp lệ' })
  roleIds!: string[];
}
