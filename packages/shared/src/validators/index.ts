// Shared validators for pos-sdd monorepo

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Validate Vietnamese phone numbers
  const phoneRegex = /^(\+84|0)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function isValidPin(pin: string): boolean {
  // 4-6 digit PIN
  return /^\d{4,6}$/.test(pin);
}

export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && isFinite(value);
}
