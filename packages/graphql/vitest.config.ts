import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text'],
      exclude: ['node_modules/', '__generated__/', '**/*.d.ts', '**/*.config.*', '**/dist/**', '**/coverage/**'],
    },
  },
  resolve: {
    alias: {
      '@portkey/graphql': resolve(__dirname, 'src'),
    },
  },
});
