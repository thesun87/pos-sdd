// Shared constants for pos-sdd monorepo

export const APP_NAME = 'POS SDD';
export const APP_VERSION = '0.1.0';

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const CURRENCY = {
  CODE: 'VND',
  LOCALE: 'vi-VN',
} as const;
