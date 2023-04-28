module.exports = [
    { source: '/api/:path*', destination: 'http://192.168.66.240:15577/api/:path*' },
    {
        source: '/AElfIndexer_DApp/:path*',
        destination: 'http://192.168.67.172:8083/AElfIndexer_DApp/:path*'
    }
];
