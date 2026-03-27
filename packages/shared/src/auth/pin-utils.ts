import * as bcrypt from 'bcryptjs';

/**
 * Hash PIN bằng bcrypt (salt rounds = 10).
 * Dùng cho cả server-side (NestJS) và offline verification (POS browser).
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

/**
 * So sánh PIN với hash đã lưu.
 * Trả về true nếu PIN khớp, false nếu không.
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Validate định dạng PIN: 4-8 ký tự số.
 */
export function validatePinFormat(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}
