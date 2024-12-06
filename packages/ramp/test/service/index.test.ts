import { describe, expect, test } from 'vitest';
import { AlchemyPayRampService, ITransDirectEnum, RampService } from '../../src';
import RampFetchRequestMock from '../__mocks__/rampRequest';
import {
  rampCryptoBuyResponse,
  rampCryptoSellResponse,
  rampDetailBuyResponse,
  rampDetailSellResponse,
  rampFiatBuyResponse,
  rampFiatSellResponse,
  rampInfoResponse,
  rampLimitBuyResponse,
  rampLimitSellResponse,
  rampPriceBuyResponse,
  rampPriceSellResponse,
} from '../__mocks__/requestData';

const rampService = new RampService({
  fetchRequest: new RampFetchRequestMock({}),
});

const alchemyPayRampService = new AlchemyPayRampService({
  fetchRequest: new RampFetchRequestMock({}),
});

const commonParams = { network: 'AELF', crypto: 'ELF', fiat: 'USD', country: 'US' };

describe('RampService', () => {
  test('execute getBuyCryptoData, and get data correctly.', async () => {
    const res = await rampService.getBuyCryptoData();
    expect(res.data).toEqual(rampCryptoBuyResponse);
  });
  test('execute getBuyDetail, and get data correctly.', async () => {
    const res = await rampService.getBuyDetail({
      fiatAmount: '200',
      ...commonParams,
    });
    expect(res.data).toEqual(rampDetailBuyResponse);
  });
  test('execute getBuyExchange, and get data correctly.', async () => {
    const res = await rampService.getBuyExchange(commonParams);
    expect(res.data.exchange).toEqual('0.64');
  });
  test('execute getBuyFiatData, and get data correctly.', async () => {
    const res = await rampService.getBuyFiatData();
    expect(res.data).toEqual(rampFiatBuyResponse);
  });
  test('execute getBuyLimit, and get data correctly.', async () => {
    const res = await rampService.getBuyLimit(commonParams);
    expect(res.data).toEqual(rampLimitBuyResponse);
  });
  test('execute getBuyPrice, and get data correctly.', async () => {
    const res = await rampService.getBuyPrice({
      fiatAmount: '200',
      ...commonParams,
    });
    expect(res.data).toEqual(rampPriceBuyResponse);
  });
  test('execute getOrderNo, and get data correctly.', async () => {
    const res = await rampService.getOrderNo({
      transDirect: ITransDirectEnum.TOKEN_BUY,
      merchantName: '',
    });
    expect(res.data.orderId).toEqual('123abc');
  });
  test('execute getRampInfo, and get data correctly.', async () => {
    const res = await rampService.getRampInfo();
    expect(res.data).toEqual(rampInfoResponse);
  });
  test('execute getSellCryptoData, and get data correctly.', async () => {
    const res = await rampService.getSellCryptoData();
    expect(res.data).toEqual(rampCryptoSellResponse);
  });
  test('execute getSellDetail, and get data correctly.', async () => {
    const res = await rampService.getSellDetail({
      cryptoAmount: '400',
      ...commonParams,
    });
    expect(res.data).toEqual(rampDetailSellResponse);
  });
  test('execute getSellExchange, and get data correctly.', async () => {
    const res = await rampService.getSellExchange(commonParams);
    expect(res.data.exchange).toEqual('0.65');
  });
  test('execute getSellFiatData, and get data correctly.', async () => {
    const res = await rampService.getSellFiatData();
    expect(res.data).toEqual(rampFiatSellResponse);
  });
  test('execute getSellLimit, and get data correctly.', async () => {
    const res = await rampService.getSellLimit(commonParams);
    expect(res.data).toEqual(rampLimitSellResponse);
  });
  test('execute getSellPrice, and get data correctly.', async () => {
    const res = await rampService.getSellPrice({
      cryptoAmount: '400',
      ...commonParams,
    });
    expect(res.data).toEqual(rampPriceSellResponse);
  });
  test('execute sendSellTransaction, and get data correctly.', async () => {
    const res = await rampService.sendSellTransaction({
      merchantName: '',
      orderId: '',
      rawTransaction: '',
      signature: '',
      publicKey: '',
    });
    expect(res.data).toEqual('success');
  });
});

describe('AlchemyPayProvider', () => {
  test('execute getAchPaySignature, and get data correctly.', async () => {
    const res = await alchemyPayRampService.getAchPaySignature({
      address: 'address',
    });
    expect(res.data.signature).toBe('signature');
  });
  test('execute getAchPayToken, and get data correctly.', async () => {
    const res = await alchemyPayRampService.getAchPayToken({
      email: 'email@google.com',
    });
    expect(res.data.accessToken).toBe('accessToken');
  });
});
