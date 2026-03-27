import { describe, it, expect } from 'vitest';
import { hashPin, verifyPin, validatePinFormat } from './pin-utils.js';

describe('PIN Utilities', () => {
  describe('validatePinFormat', () => {
    it('should accept 4-digit PIN', () => {
      expect(validatePinFormat('1234')).toBe(true);
    });

    it('should accept 8-digit PIN', () => {
      expect(validatePinFormat('12345678')).toBe(true);
    });

    it('should accept 6-digit PIN', () => {
      expect(validatePinFormat('123456')).toBe(true);
    });

    it('should reject PIN with less than 4 digits', () => {
      expect(validatePinFormat('123')).toBe(false);
    });

    it('should reject PIN with more than 8 digits', () => {
      expect(validatePinFormat('123456789')).toBe(false);
    });

    it('should reject PIN with letters', () => {
      expect(validatePinFormat('abcd')).toBe(false);
    });

    it('should reject PIN with special characters', () => {
      expect(validatePinFormat('1234!')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validatePinFormat('')).toBe(false);
    });
  });

  describe('hashPin + verifyPin', () => {
    it('should hash a PIN and verify it correctly', async () => {
      const pin = '1234';
      const hash = await hashPin(pin);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(pin);
      expect(await verifyPin(pin, hash)).toBe(true);
    });

    it('should return false for wrong PIN', async () => {
      const pin = '1234';
      const wrongPin = '9999';
      const hash = await hashPin(pin);

      expect(await verifyPin(wrongPin, hash)).toBe(false);
    });

    it('should generate different hashes for same PIN (salt)', async () => {
      const pin = '1234';
      const hash1 = await hashPin(pin);
      const hash2 = await hashPin(pin);

      expect(hash1).not.toBe(hash2);
      expect(await verifyPin(pin, hash1)).toBe(true);
      expect(await verifyPin(pin, hash2)).toBe(true);
    });
  });
});
