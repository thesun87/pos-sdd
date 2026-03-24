/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: ['node_modules/', 'dist/', '*.d.ts'],
};
