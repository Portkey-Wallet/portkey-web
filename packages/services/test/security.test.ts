import { describe, expect, test } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { Security } from '../src/service/security';

// jest.mock('./request');

const request = new FetchRequestMock({});
const securityService = new Security(request);

describe('securityService describe', () => {
  test('test getWalletBalanceCheck', async () => {
    const result = await securityService.getWalletBalanceCheck({
      caHash: 'caHash_mock',
      checkTransferSafeChainId: 'tDVV',
    });

    expect(result).toHaveProperty('isSafe');
  });
  test('test getPaymentSecurityList', async () => {
    const result = await securityService.getPaymentSecurityList({
      caHash: 'caHash_mock',
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.data.length > 0) {
      const item = result.data[0];
      expect(item).toHaveProperty('chainId');
      expect(item).toHaveProperty('symbol');
      expect(item).toHaveProperty('singleLimit');
      expect(item).toHaveProperty('dailyLimit');
      expect(item).toHaveProperty('restricted');
      expect(item).toHaveProperty('decimals');
    }
  });
});
