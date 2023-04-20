/* eslint-disable */

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
};
