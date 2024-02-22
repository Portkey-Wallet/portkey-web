module.exports = [
    // test1
    // { source: '/api/:path*', destination: 'http://192.168.66.240:5577/api/:path*' },
    // { source: '/connect/:path*', destination: 'http://192.168.66.240:8080/connect/:path*' },

    // // test2
    // { source: '/api/:path*', destination: 'http://192.168.67.51:5577/api/:path*' },
    // { source: '/connect/:path*', destination: 'http://192.168.67.51:8080/connect/:path*' },
    // { source: '/graphql/:path*', destination: 'http://192.168.67.51:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql/:path*' },

    // test3
    // { source: '/api/:path*', destination: 'http://192.168.64.201:5001/api/:path*' },
    // { source: '/connect/:path*', destination: 'http://192.168.64.201:8080/connect/:path*' },
    // { source: '/graphql/:path*', destination: 'http://192.168.64.202:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql/:path*' },

    // // test4
    { source: '/api/:path*', destination: 'http://192.168.66.117:5577/api/:path*' },
    { source: '/connect/:path*', destination: 'http://192.168.66.117:8080/connect/:path*' },
    { source: '/graphql/:path*', destination: 'http://192.168.67.214:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql/:path*' },

    // mainnet
    // { source: '/api/:path*', destination: 'https://did-portkey.portkey.finance/api/:path*' },
    // { source: '/connect/:path*', destination: 'https://auth-portkey.portkey.finance/connect/:path*' },

    // testnet
    // { source: '/api/:path*', destination: 'https://aa-portkey-test.portkey.finance/api/:path*' },
    // { source: '/connect/:path*', destination: 'https://auth-aa-portkey-test.portkey.finance/connect/:path*' },

];
