/** @type {import('next').NextConfig} */
const rewrites = require('./rewrites');

const nextConfig = {
  async rewrites() {
    return rewrites;
  },
}

module.exports = nextConfig
