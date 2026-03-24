import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.tsx', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    passWithNoTests: true,
  },
});
