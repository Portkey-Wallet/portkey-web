import { describe, expect, test } from 'vitest';
import FetchRequestMock from './__mocks__/request';
import { Transaction } from '../src/service/transaction';

// jest.mock('./request');

const request = new FetchRequestMock({});
const transactionService = new Transaction(request);

describe('transactionService describe', () => {
  test('test getRecentTransactionUsers', async () => {
    const result = await transactionService.getRecentTransactionUsers({
      caAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.data.length > 0) {
      const item = result.data[0];
      expect(item).toHaveProperty('chainId');
      expect(item).toHaveProperty('caAddress');
      expect(item).toHaveProperty('address');
      expect(item).toHaveProperty('addressChainId');
      expect(item).toHaveProperty('transactionTime');
      expect(item).toHaveProperty('addresses');
    }
  });
});
