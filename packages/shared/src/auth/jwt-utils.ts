/**
 * JWT Payload structure cho POS/KDS offline-capable authentication.
 */
export interface JwtPayload {
  userId: string;
  tenantId: string;
  roles: string[];
  storeAssignments: {
    storeId: string;
    scopeType: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
  }[];
  iat: number; // issued at (unix timestamp)
  exp: number; // expiry (unix timestamp) — 24h từ iat
}

/**
 * Kiểm tra xem JWT payload có hết hạn không.
 */
export function isTokenExpired(payload: JwtPayload): boolean {
  return Math.floor(Date.now() / 1000) > payload.exp;
}
