import { describe, expect, test } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { Activity } from '../src/service/activity';

// jest.mock('./request');

const request = new FetchRequestMock({});
const activityService = new Activity(request);

describe('activityService describe', () => {
  test('test getActivityList', async () => {
    const result = await activityService.getActivityList({
      caAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.data.length > 0) {
      const item = result.data[0];
      expect(item).toHaveProperty('transactionType');
      expect(item).toHaveProperty('from');
      expect(item).toHaveProperty('to');
      expect(item).toHaveProperty('fromAddress');
      expect(item).toHaveProperty('toAddress');
      expect(item).toHaveProperty('fromChainId');
      expect(item).toHaveProperty('toChainId');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('transactionId');
      expect(item).toHaveProperty('blockHash');
      expect(item).toHaveProperty('timestamp');
      expect(item).toHaveProperty('isReceived');
      expect(item).toHaveProperty('amount');
      expect(item).toHaveProperty('symbol');
      expect(item).toHaveProperty('transactionFees');
    }
  });
  test('test getActivityDetail', async () => {
    const result = await activityService.getActivityDetail({
      caAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      transactionId: 'transactionId_mock',
      blockHash: 'blockHash_mock',
    });

    expect(result).toHaveProperty('transactionType');
    expect(result).toHaveProperty('from');
    expect(result).toHaveProperty('to');
    expect(result).toHaveProperty('fromAddress');
    expect(result).toHaveProperty('toAddress');
    expect(result).toHaveProperty('fromChainId');
    expect(result).toHaveProperty('toChainId');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('transactionId');
    expect(result).toHaveProperty('blockHash');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('isReceived');
    expect(result).toHaveProperty('amount');
    expect(result).toHaveProperty('symbol');
    expect(result).toHaveProperty('transactionFees');
  });
  test('test getRecentContactActivities', async () => {
    const result = await activityService.getRecentContactActivities({
      caAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      targetAddressInfos: [{ caAddress: 'caAddress_mock', chainId: 'AELF' }],
      skipCount: 0,
      maxResultCount: 10,
    });

    expect(Array.isArray(result.data)).toBe(true);
    expect(result).toHaveProperty('totalRecordCount');

    if (result.data.length > 0) {
      const item = result.data[0];
      expect(item).toHaveProperty('transactionType');
      expect(item).toHaveProperty('from');
      expect(item).toHaveProperty('to');
      expect(item).toHaveProperty('fromAddress');
      expect(item).toHaveProperty('toAddress');
      expect(item).toHaveProperty('fromChainId');
      expect(item).toHaveProperty('toChainId');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('transactionId');
      expect(item).toHaveProperty('blockHash');
      expect(item).toHaveProperty('timestamp');
      expect(item).toHaveProperty('isReceived');
      expect(item).toHaveProperty('amount');
      expect(item).toHaveProperty('symbol');
      expect(item).toHaveProperty('transactionFees');
    }
  });
});
