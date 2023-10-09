
const apiConfig = {
  test1: {
    api: 'http://192.168.66.240:5577',
    connect: 'http://192.168.66.240:8080'
  },
  test2: {
    api: 'http://192.168.67.51:5577',
    connect: 'http://192.168.67.51:8080',
    graphql: 'http://192.168.67.51:8083'
  },
  mainnet: {
    api: 'https://did-portkey.portkey.finance',
    connect: 'https://auth-portkey.portkey.finance',
    graphql: 'http://192.168.67.51:8083'
  },
  testnet: {
    api: 'https://did-portkey-test.portkey.finance',
    connect: 'https://auth-portkey-test.portkey.finance',
  }
}
module.exports = apiConfig