module.exports = [
    { source: '/api/:path*', destination: 'https://did-portkey.portkey.finance/api/:path*' },
    { source: '/connect/:path*', destination: 'https://did-portkey.portkey.finance/connect/:path*' },
    // {
    //     source: '/AElfIndexer_DApp/:path*',
    //     destination: 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/:path*'
    // }
];
