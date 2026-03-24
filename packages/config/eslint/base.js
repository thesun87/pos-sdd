/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
  ],
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
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'coverage/',
    '*.js.map',
    '*.d.ts',
  ],
};
