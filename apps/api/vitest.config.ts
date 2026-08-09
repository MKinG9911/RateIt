import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@rateit/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
    extensions: ['.ts', '.js', '.json', '.jsx', '.tsx'],
  },
});
