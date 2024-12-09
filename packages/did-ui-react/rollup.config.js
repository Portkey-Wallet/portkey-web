import createConfig from '../../rollup.config.mjs';

const baseConfig = createConfig('@portkey/did-ui-react');

export default [
  ...baseConfig,
  {
    ...baseConfig[0],
    // new entrypoint to split styles into separate import
    input: './style.ts',
    output: [
      { file: './dist/style.js', format: 'es', exports: 'named', name: '@portkey/did-ui-react', sourcemap: true },
    ],
  },
];
