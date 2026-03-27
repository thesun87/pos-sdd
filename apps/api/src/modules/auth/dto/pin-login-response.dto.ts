export interface StoreAssignment {
  storeId: string;
  scopeType: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
}

export interface PinLoginUserDto {
  id: string;
  name: string;
  email: string;
  roles: string[];
  storeAssignments: StoreAssignment[];
}

export interface PinLoginResponseDto {
  token: string;
  user: PinLoginUserDto;
}
