import { describe, expect, test } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { Ramp } from '../src/service/ramp';

// jest.mock('./request');

const request = new FetchRequestMock({});
const ramp = new Ramp(request);

describe('ramp describe', () => {
  test('test getFiatList', async () => {
    const result = await ramp.getFiatList({
      type: 'BUY',
    });
    expect(result).toHaveProperty('returnCode');
    expect(result).toHaveProperty('data');
  });

  test('test getCryptoList', async () => {
    const result = await ramp.getCryptoList({
      fiat: 'USD',
    });
    expect(result).toHaveProperty('returnCode');
    expect(result).toHaveProperty('data');
  });

  test('test getOrderQuote', async () => {
    const result = await ramp.getOrderQuote({
      crypto: 'crypto_mock',
      network: 'network_mock',
      fiat: 'USD',
      country: 'US',
      amount: '100',
      side: 'BUY',
      type: 'ONE',
    });
    expect(result).toHaveProperty('returnCode');
    expect(result).toHaveProperty('data');
  });

  test('test getAchToken', async () => {
    const result = await ramp.getAchToken({
      email: 'email_mock',
    });
    expect(result).toHaveProperty('returnCode');
    expect(result).toHaveProperty('data');
  });

  test('test getOrderNo', async () => {
    const result = await ramp.getOrderNo({
      transDirect: 'TokenBuy',
    });
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('id');
  });

  test('test getAchSignature', async () => {
    const result = await ramp.getAchSignature({
      address: 'address_mock',
    });
    expect(result).toHaveProperty('returnCode');
    expect(result).toHaveProperty('signature');
  });

  test('test sendSellTransaction', async () => {
    const result = await ramp.sendSellTransaction({
      merchantName: 'Alchemy',
      orderId: 'orderId_mock',
      rawTransaction: 'rawTransaction_mock',
      signature: 'signature_mock',
      publicKey: 'publicKey_mock',
    });
    expect(result).toBeDefined();
  });
});
