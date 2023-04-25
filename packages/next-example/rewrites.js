module.exports = [
    { source: '/api/:path*', destination: 'https://localtest-applesign.portkey.finance/api/:path*' },
    {
        source: '/AElfIndexer_DApp/:path*',
        destination: 'http://192.168.67.172:8083/AElfIndexer_DApp/:path*'
    }
];
