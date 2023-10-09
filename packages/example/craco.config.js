/* eslint-disable */
const path = require('path')
const resolve = dir => path.resolve(__dirname, dir);
const webpack = require('webpack');
const apiConfig = require('./rewrites')

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: apiConfig.test2.api,
        changeOrigin: true,
        secure: true,
      },
      '/connect': {
        target: apiConfig.test2.connect,
        changeOrigin: true,
        secure: true,
      }
    },
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          buffer: require.resolve('buffer'),
        },
      },
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  }
};
