import { describe, expect, test } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { Search } from '../src/service/search';

// jest.mock('./request');

const request = new FetchRequestMock({});
const search = new Search(request);

describe('search describe', () => {
  test('test getChainsInfo', async () => {
    const result = await search.getChainsInfo();
    expect(result[0]).toHaveProperty('chainId');
    expect(result[0]).toHaveProperty('chainName');
    expect(result[0]).toHaveProperty('endPoint');
    expect(result[0]).toHaveProperty('explorerUrl');
    expect(result[0]).toHaveProperty('caContractAddress');
    expect(result[0]).toHaveProperty('lastModifyTime');
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('defaultToken');
    expect(result[0].defaultToken).toHaveProperty('name');
    expect(result[0].defaultToken).toHaveProperty('address');
    expect(result[0].defaultToken).toHaveProperty('imageUrl');
    expect(result[0].defaultToken).toHaveProperty('symbol');
    expect(result[0].defaultToken).toHaveProperty('decimals');
  });

  test('test getRegisterStatus', async () => {
    const result = await search.getRegisterStatus('id_mock');
    expect(result).toHaveProperty('registerStatus');
    expect(result).toHaveProperty('registerMessage');
  });

  test('test getRecoverStatus', async () => {
    const result = await search.getRecoverStatus('id_mock');
    expect(result).toHaveProperty('recoveryStatus');
    expect(result).toHaveProperty('recoveryMessage');
  });
});
