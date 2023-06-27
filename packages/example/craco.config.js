/* eslint-disable */
const path = require('path')
const resolve = dir => path.resolve(__dirname, dir);
const webpack = require('webpack');

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.67.51:5577',
        changeOrigin: true,
        secure: true,
      },
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
