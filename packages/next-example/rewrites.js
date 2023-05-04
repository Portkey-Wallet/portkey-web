const rewrite = [
    { source: '/api/:path*', destination: 'https://did-portkey.portkey.finance/api/:path*' },
    {
        source: '/AElfIndexer_DApp/PortKeyIndexerCASchema/:path*',
        destination: 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/:path*',
    },
];

module.exports = rewrite;