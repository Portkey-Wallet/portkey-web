import esbuild from 'rollup-plugin-esbuild';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import postcssUrl from 'postcss-url';
import copy from 'rollup-plugin-copy';

import minifyHtml from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';

import path from 'path';

export default function createConfig(packageName) {
  const output = {
    exports: 'named',
    name: packageName,
    sourcemap: true,
  };

  const production = !process.env.ROLLUP_WATCH;

  const esbuildPlugin = esbuild({
    minify: true,
    tsconfig: './tsconfig.json',
    platform: 'browser',
    treeShaking: true,
    loaders: {
      '.json': 'json',
    },
  });

  const copyPlugin = copy({
    targets: [
      // Need to copy the files over for usage
      { src: 'src/assets/fonts', dest: 'dist/assets' },
      // { src: 'src/sandbox', dest: 'dist' },
    ],
  });

  const postcssPlugin = postcss({
    minimize: true,
    modules: false,
    autoModules: true,
    extensions: ['.css', '.less'],
    use: {
      sass: null,
      stylus: null,
      less: { javascriptEnabled: true },
    },
    extract: path.resolve('dist/assets/index.css'),
    plugins: [
      postcssUrl({
        url: 'inline', // enable inline assets using base64 encoding
        maxSize: 10, // maximum file size to inline (in kilobytes)
        fallback: 'copy', // fallback method to use if max size is exceeded
      }),
    ],
  });

  const urlPlugin = url();

  const terserPlugin =
    production &&
    terser({
      compress: {
        drop_console: production,
        drop_debugger: production,
      },
      output: { comments: false },
    });

  return [
    {
      input: './index.ts',
      plugins: [minifyHtml, esbuildPlugin, postcssPlugin, urlPlugin, copyPlugin, terserPlugin],
      output: [{ file: './dist/index.js', format: 'es', ...output }],
    },
    // {
    //   input: './src/sandbox/index.ts',
    //   plugins: [esbuildPlugin, urlPlugin, terserPlugin],
    //   output: [{ file: './src/sandbox/index.js', format: 'es', ...output }],
    // },
  ];
}
