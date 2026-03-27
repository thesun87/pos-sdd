export interface JwtPayload {
  userId: string;
  tenantId: string;
  roles: string[];
  storeAssignments: {
    storeId: string;
    scopeType: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
  }[];
  iat?: number;
  exp?: number;
}
