import { describe, expect, test } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { Assets } from '../src/service/assets';

// jest.mock('./request');

const request = new FetchRequestMock({});
const assetsService = new Assets(request);

describe('assetsService describe', () => {
  test('test fetchAccountTokenList', async () => {
    const result = await assetsService.fetchAccountTokenList({
      caAddresses: ['caAddresses_mock'],
      caAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.data.length > 0) {
      const item = result.data[0];
      expect(item).toHaveProperty('decimals');
      expect(item).toHaveProperty('symbol');
      expect(item).toHaveProperty('tokenContractAddress');
      expect(item).toHaveProperty('balance');
      expect(item).toHaveProperty('chainId');
      expect(item).toHaveProperty('balanceInUsd');
      expect(item).toHaveProperty('imageUrl');
      expect(item).toHaveProperty('price');
    }
  });

  test('test getSymbolImages', async () => {
    const result = await assetsService.getSymbolImages({});
    expect(result).toHaveProperty('symbolImages');
  });

  test('test fetchAccountNftCollectionList', async () => {
    const result = await assetsService.fetchAccountNftCollectionList({
      caAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      width: 300,
      height: -1,
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.data.length > 0) {
      const item = result.data[0];
      expect(item).toHaveProperty('chainId');
      expect(item).toHaveProperty('collectionName');
      expect(item).toHaveProperty('imageUrl');
      expect(item).toHaveProperty('itemCount');
      expect(item).toHaveProperty('symbol');
    }
  });

  test('test fetchAccountNftCollectionItemList', async () => {
    const result = await assetsService.fetchAccountNftCollectionItemList({
      symbol: 'symbol_mock',
      caAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      width: 300,
      height: -1,
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.data.length > 0) {
      const item = result.data[0];
      expect(item).toHaveProperty('alias');
      expect(item).toHaveProperty('balance');
      expect(item).toHaveProperty('chainId');
      expect(item).toHaveProperty('imageLargeUrl');
      expect(item).toHaveProperty('imageUrl');
      expect(item).toHaveProperty('symbol');
      expect(item).toHaveProperty('tokenContractAddress');
      expect(item).toHaveProperty('tokenId');
      expect(item).toHaveProperty('totalSupply');
    }
  });

  test('test fetchTokenPrice', async () => {
    const result = await assetsService.fetchTokenPrice({
      symbols: ['symbol_mock'],
    });

    expect(Array.isArray(result.items)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.items.length > 0) {
      const item = result.items[0];
      expect(item).toHaveProperty('symbol');
      expect(item).toHaveProperty('priceInUsd');
    }
  });

  test('test getUserTokenList', async () => {
    const result = await assetsService.getUserTokenList({
      keyword: 'address_mock',
      chainIdArray: ['AELF'],
    });

    expect(Array.isArray(result.items)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.items.length > 0) {
      const item = result.items[0];
      expect(item).toHaveProperty('isDisplay');
      expect(item).toHaveProperty('isDefault');
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('token');
    }

    const result2 = await assetsService.getUserTokenList({
      keyword: 'symbol',
      chainIdArray: ['AELF'],
    });

    expect(Array.isArray(result2.items)).toBe(true);
    expect(result2).toHaveProperty('totalRecordCount');

    if (result2.items.length > 0) {
      const item = result2.items[0];
      expect(item).toHaveProperty('isDisplay');
      expect(item).toHaveProperty('isDefault');
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('token');
    }
  });

  test('test getAccountAssetsByKeywords', async () => {
    const result = await assetsService.getAccountAssetsByKeywords({
      caAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.data.length > 0) {
      const item = result.data[0];
      expect(item).toHaveProperty('chainId');
      expect(item).toHaveProperty('symbol');
      expect(item).toHaveProperty('address');
    }
  });
});
