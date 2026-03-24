// Shared utilities for pos-sdd monorepo

import { CURRENCY } from '../constants/index.js';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = 'vi-VN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}
