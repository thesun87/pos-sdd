import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 vai trò' })
  @IsUUID('all', { each: true, message: 'Mỗi roleId phải là UUID hợp lệ' })
  roleIds!: string[];
}
