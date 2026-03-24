import nextConfig from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', '*.d.ts'],
  },
];

export default config;
