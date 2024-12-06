import { describe, expect, test } from 'vitest';
import FetchRequestMock from './__mocks__/request';
import { Token } from '../src/service/token';

// jest.mock('./request');

const request = new FetchRequestMock({});
const tokenService = new Token(request);

describe('tokenService describe', () => {
  test('test fetchTxFee', async () => {
    const result = await tokenService.fetchTxFee({
      chainIds: ['AELF'],
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('chainId');
    expect(result[0]).toHaveProperty('transactionFee');
  });
});
