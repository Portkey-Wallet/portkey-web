import { IRampProviderType } from '../../src';

export const rampRequestConfig = {
  headers: {
    Version: 'v1.6.0',
    'Client-Type': 'ThirdParty',
    Authorization: 'Bearer xxx',
  },
  baseURL: 'https://xxx.com',
  socketUrl: 'https://xxx.com/ca',
};

export const thirdPart = {
  [IRampProviderType.AlchemyPay]: {
    key: IRampProviderType.AlchemyPay,
    name: 'Alchemy Pay',
    appId: 'xxxAlchemyPayAppid',
    baseUrl: 'https://xxx.alchemypay.com',
    callbackUrl: 'https://xxx-alchemypay-callback.com',
    logo: 'https://alchemypay-logo.svg',
    coverage: { buy: true, sell: true },
    paymentTags: ['payment1', 'payment2'],
  },
  [IRampProviderType.Transak]: {
    key: IRampProviderType.Transak,
    name: 'Transak',
    appId: 'xxxTransakAppid',
    baseUrl: 'https://xxx.transak.com',
    callbackUrl: 'https://xxx-transak-callback.com',
    logo: 'https://transak-logo.svg',
    coverage: { buy: true, sell: true },
    paymentTags: ['payment1', 'payment2'],
  },
};
