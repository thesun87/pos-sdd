import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.test.tsx', '**/*.test.ts'],
    exclude: ['node_modules', '.next'],
    passWithNoTests: true,
  },
});
