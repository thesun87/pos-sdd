/**
 * Dữ liệu auth được cache tại POS cho offline verification.
 * Lưu trữ trong localStorage được mã hóa bằng Web Crypto API AES-256.
 */
export interface CachedAuthData {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  roles: string[];
  storeAssignments: {
    storeId: string;
    scopeType: 'SINGLE_STORE' | 'STORE_GROUP' | 'ALL_STORES';
  }[];
  pinHash: string;
  cachedAt: number; // Unix timestamp (ms)
}

/**
 * Kiểm tra xem cache auth data có còn hợp lệ không.
 * @param cachedAt - Thời điểm cache (Unix ms)
 * @param maxAgeMs - Thời gian tối đa cache còn hợp lệ (ms)
 */
export function isAuthCacheValid(cachedAt: number, maxAgeMs: number): boolean {
  return Date.now() - cachedAt < maxAgeMs;
}
