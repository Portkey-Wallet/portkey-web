import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { readdirSync, lstatSync } from 'fs';

// get listing of packages in the mono repo
const basePath = resolve(__dirname, 'packages');
const packages = readdirSync(basePath).filter((name: string) => lstatSync(resolve(basePath, name)).isDirectory());

const alias: Record<string, string> = {};
packages.forEach((key: string) => {
  alias[`@portkey/${key}`] = resolve(__dirname, `packages/${key}/src`);
});

const EXCLUDE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/cypress/**',
  '**/.{idea,git,cache,output,temp}/**',
  '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
  // Exclude packages without test files
  'packages/connect-web-wallet/**',
  'packages/contracts/**',
  'packages/did-ui-react/**',
  'packages/example/**',
  'packages/next-example/**',
  'packages/onboarding/**',
  'packages/request/**',
  'packages/types/**',
  'packages/validator/**',
  // Exclude browser-specific tests
  '**/devices.test.ts',
];

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text'],
      exclude: [...EXCLUDE, '**/__generated__/**', '**/types/**', '**/*.d.ts', '**/*.config.*', '**/coverage/**'],
      include: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
    },
    exclude: EXCLUDE,
  },
  resolve: {
    alias: {
      ...alias,
      'aelf-sdk': resolve(__dirname, 'node_modules/aelf-sdk/dist/aelf.cjs'),
      'aelf-sdk/src/wallet': resolve(__dirname, 'node_modules/aelf-sdk/src/wallet/index.js'),
      'aelf-sdk/src/util/keyStore': resolve(__dirname, 'node_modules/aelf-sdk/src/util/keyStore.js'),
    },
  },
});
