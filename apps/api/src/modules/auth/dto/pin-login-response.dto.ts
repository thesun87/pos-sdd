import { ApiProperty } from '@nestjs/swagger';

export class StoreAssignment {
  @ApiProperty()
  storeId!: string | null;

  @ApiProperty({ enum: ['SINGLE_STORE', 'STORE_GROUP', 'ALL_STORES'] })
  scopeType!: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
}

export class PinLoginUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty({ type: [StoreAssignment] })
  storeAssignments!: StoreAssignment[];
}

export class PinLoginResponseDto {
  @ApiProperty()
  token!: string;

  @ApiProperty({ type: PinLoginUserDto })
  user!: PinLoginUserDto;
}
