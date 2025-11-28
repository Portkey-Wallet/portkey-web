export const LOGIN_CONFIG = {
  MAINNET: {
    connectUrl: 'https://auth-aa-portkey.portkey.finance',
    loginConfig: {
      loginMethodsOrder: ['Email', 'Telegram', 'Google', 'Apple', 'Scan'],
      recommendIndexes: [0, 2],
    },
    requestDefaults: {
      timeout: 30000,
      baseURL: 'https://aa-portkey.portkey.finance',
    },
    serviceUrl: 'https://aa-portkey.portkey.finance',
    graphQLUrl: 'https://indexer-api.aefinder.io/api/app/graphql/portkey',
  },
  TESTNET: {
    connectUrl: 'https://auth-aa-portkey-test.portkey.finance',
    loginConfig: {
      loginMethodsOrder: ['Email', 'Telegram', 'Google', 'Apple', 'Scan'],
      recommendIndexes: [0, 2],
    },
    requestDefaults: {
      timeout: 30000,
      baseURL: 'https://aa-portkey-test.portkey.finance',
    },
    serviceUrl: 'https://aa-portkey-test.portkey.finance',
    graphQLUrl: 'https://test-indexer-api.aefinder.io/api/app/graphql/portkey',
  },
} as const;
