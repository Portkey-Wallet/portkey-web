/// <reference types="vitest" />
import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const exclude = [...configDefaults.exclude, '**/dist/*.*', '**/.*', '**/*.setup.*'];

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    // https://github.com/vitejs/vite/discussions/2785#discussioncomment-7803485
    nodePolyfills({
      include: ['path', 'stream', 'util'],
      exclude: ['http'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        fs: 'memfs',
      },
      protocolImports: true,
    }),
  ],
  test: {
    pool: 'vmThreads',
    poolOptions: {
      vmThreads: {
        useAtomics: true,
      },
    },
    isolate: true,
    css: false,
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: [],
        },
      },
    },
    globals: true,
    watch: false,
    environment: 'node',
    setupFiles: ['./vitest.setup'],
    include: ['./src/*(*.)?{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'bridge',
    exclude,
    reporters: ['default'],
    coverage: {
      all: false,
      enabled: true,
      provider: 'v8',
      exclude: [...exclude, '**/__tests__/*.*', '**/test/*.*'],
      reportsDirectory: './coverage',
      reporter: [['json-summary', { file: 'coverage-summary.json' }], ['lcov', { file: 'lcov.info' }], ['text']],
    },
  },
  worker: {
    format: 'es',
  },
});
