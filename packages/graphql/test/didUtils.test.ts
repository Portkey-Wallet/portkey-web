import { describe, expect, test } from 'vitest';
import { getCAHolderManagerInfo, getLoginGuardianAccount } from '../src/did/utils';

const client = {
  query: ({ variables }) => {
    return {
      data: variables,
    };
  },
} as any;

describe('didUtils describe', () => {
  test('test getCAHolderManagerInfo', async () => {
    const result = await getCAHolderManagerInfo(client, 'getCAHolderManagerInfo_mock' as any);
    expect(result.data).toEqual('getCAHolderManagerInfo_mock');
  });
  test('test getLoginGuardianAccount', async () => {
    const result = await getLoginGuardianAccount(client, 'getLoginGuardianAccount_mock' as any);
    expect(result.data).toEqual('getLoginGuardianAccount_mock');
  });
});
