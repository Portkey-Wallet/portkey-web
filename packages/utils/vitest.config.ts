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
    exclude: [
      '**/devices.test.ts', // 这个测试需要浏览器环境
    ],
  },
  resolve: {
    alias: {
      '@portkey/utils': resolve(__dirname, 'src'),
    },
  },
});
