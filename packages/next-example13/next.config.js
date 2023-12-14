const rewrites = require('./rewrites');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async rewrites() {
        return rewrites;
    },
}

module.exports = nextConfig
