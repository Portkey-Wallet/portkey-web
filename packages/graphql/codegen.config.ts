import { CodegenConfig } from '@graphql-codegen/cli';
import schemaPath from './schemaPath.config.js';

const config: CodegenConfig = {
  generates: {},
  config: {
    scalars: {
      Long: 'number',
    },
  },
};

schemaPath.forEach(({ name, path }) => {
  config.generates[`./src/${name}/__generated__/types.ts`] = {
    schema: path,
    plugins: ['typescript'],
  };
  config.generates[`${name}/`] = {
    documents: [`./src/${name}/__generated__/operation/**/*`],
    schema: path,
    preset: 'near-operation-file',
    presetConfig: {
      baseTypesPath: `../src/${name}/__generated__/types.ts`,
      extension: '.ts',
      folder: `../../hooks`,
    },
    plugins: ['typescript-operations', 'typescript-react-apollo'],
    // plugins: ['typescript-operations'],
    config: {
      // defaultBaseOptions: {}
    },
  };
});

export default config;
