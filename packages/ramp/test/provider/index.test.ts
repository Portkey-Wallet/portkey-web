import { describe, expect, test } from '@jest/globals';
import {
  AlchemyPayProvider,
  AlchemyPayRampService,
  IRampProviderType,
  RampService,
  RampType,
  TransakProvider,
} from '../../src';
import RampFetchRequestMock from '../__mocks__/rampRequest';
import { thirdPart } from '../__mocks__/commonData';

const createOrderCommonParams = {
  address: 'address',
  crypto: 'ELF',
  network: 'AELF',
  country: 'US',
  fiat: 'USD',
  amount: '200',
};

const alchemyPayProvider = new AlchemyPayProvider({
  providerInfo: {
    ...thirdPart[IRampProviderType.AlchemyPay],
  },
  service: new AlchemyPayRampService({
    fetchRequest: new RampFetchRequestMock({}),
  }),
});

const transakProvider = new TransakProvider({
  providerInfo: {
    ...thirdPart[IRampProviderType.Transak],
  },
  service: new RampService({
    fetchRequest: new RampFetchRequestMock({}),
  }),
});

describe('AlchemyPayProvider', () => {
  test('BUY: execute createOrder, and get orderId and url successfully.', async () => {
    const res = await alchemyPayProvider.createOrder({
      type: RampType.BUY,
      ...createOrderCommonParams,
      withdrawUrl: 'withdrawUrl',
      email: 'email@google.com',
    });

    expect(res.orderId).toBe('123abc');
    expect(res.url).toBe(
      'https://xxx.alchemypay.com/?type=buy&crypto=ELF&network=AELF&country=US&fiat=USD&appId=xxxAlchemyPayAppid&callbackUrl=https%3A%2F%2Fxxx-alchemypay-callback.com&merchantOrderNo=123abc&withdrawUrl=withdrawUrl%26payload%3D%257B%2522orderNo%2522%253A%2522123abc%2522%257D&fiatAmount=200&token=accessToken&address=address&sign=signature',
    );
  });
  test('SELL: execute createOrder, and get orderId and url successfully.', async () => {
    const res = await alchemyPayProvider.createOrder({
      type: RampType.SELL,
      ...createOrderCommonParams,
      withdrawUrl: 'withdrawUrl',
      email: 'email@google.com',
    });

    expect(res.orderId).toBe('123abc');
    expect(res.url).toBe(
      'https://xxx.alchemypay.com/?type=sell&crypto=ELF&network=AELF&country=US&fiat=USD&appId=xxxAlchemyPayAppid&callbackUrl=https%3A%2F%2Fxxx-alchemypay-callback.com&merchantOrderNo=123abc&withdrawUrl=withdrawUrl%26payload%3D%257B%2522orderNo%2522%253A%2522123abc%2522%257D&cryptoAmount=200&source=3#/sell-formUserInfo',
    );
  });
});

describe('TransakProvider', () => {
  test('BUY: execute createOrder, and get orderId and url successfully.', async () => {
    const res = await transakProvider.createOrder({
      type: RampType.BUY,
      ...createOrderCommonParams,
    });

    expect(res.orderId).toBe('123abc');
    expect(res.url).toBe(
      'https://xxx.transak.com?apiKey=xxxTransakAppid&countryCode=US&cryptoCurrencyCode=ELF&fiatAmount=200&fiatCurrency=USD&network=AELF&partnerOrderId=123abc&productsAvailed=BUY&walletAddress=address',
    );
  });
  test('SELL: execute createOrder, and get orderId and url successfully.', async () => {
    const res = await transakProvider.createOrder({
      type: RampType.SELL,
      ...createOrderCommonParams,
    });

    expect(res.orderId).toBe('123abc');
    expect(res.url).toBe('');
  });
});
