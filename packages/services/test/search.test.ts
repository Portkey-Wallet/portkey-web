import { describe, expect, test } from 'vitest';
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
    let times = 0;
    const request = {
      send: () => {
        switch (times) {
          case 0:
            times++;
            return {
              items: [],
            };
          case 1:
            times++;
            return {
              items: [
                {
                  caAddress: 'caAddress_mock',
                  caHash: 'caHash_mock',
                  registerStatus: 'pending',
                  registerMessage: 'registerMessage_mock',
                },
              ],
            };
          default:
            return {
              items: [
                {
                  caAddress: 'caAddress_mock',
                  caHash: 'caHash_mock',
                  registerStatus: 'pass',
                  registerMessage: 'registerMessage_mock',
                },
              ],
            };
        }
      },
    };
    const search = new Search(request as any);

    const result = await search.getRegisterStatus('id_mock', {
      interval: 50,
      reCount: 0,
      maxCount: 20,
    });
    expect(result).toHaveProperty('registerStatus');
    expect(result).toHaveProperty('registerMessage');

    try {
      await search.getRegisterStatus('id_mock', {
        interval: 50,
        reCount: 1,
        maxCount: 0,
      });
    } catch (error) {
      expect(error).not.toBeUndefined();
    }
  });

  test('test getRecoverStatus', async () => {
    let times = 0;
    const request = {
      send: () => {
        switch (times) {
          case 0:
            times++;
            return {
              items: [],
            };
          case 1:
            times++;
            return {
              items: [
                {
                  caAddress: 'caAddress_mock',
                  caHash: 'caHash_mock',
                  recoveryStatus: 'pending',
                  recoveryMessage: 'recoveryMessage_mock',
                },
              ],
            };
          default:
            return {
              items: [
                {
                  caAddress: 'caAddress_mock',
                  caHash: 'caHash_mock',
                  recoveryStatus: 'pass',
                  recoveryMessage: 'recoveryMessage_mock',
                },
              ],
            };
        }
      },
    };
    const search = new Search(request as any);
    const result = await search.getRecoverStatus('id_mock', {
      interval: 50,
      reCount: 0,
      maxCount: 20,
    });
    expect(result).toHaveProperty('recoveryStatus');
    expect(result).toHaveProperty('recoveryMessage');

    try {
      await search.getRecoverStatus('id_mock', {
        interval: 50,
        reCount: 1,
        maxCount: 0,
      });
    } catch (error) {
      expect(error).not.toBeUndefined();
    }
  });

  test('test caholderindex', async () => {
    const result = await search.getCAHolderInfo('Authorization_mock', 'caAddress_mock');
    expect(result).toHaveProperty('caAddress');
  });
});
