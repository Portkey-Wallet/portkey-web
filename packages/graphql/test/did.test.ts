import 'isomorphic-fetch';
import { describe, expect, test, vi } from 'vitest';

import { getGraphQLClientProvider } from '../src/client';
vi.mock('../src/did/utils', () => {
  return {
    getCAHolderManagerInfo: (_, { dto: { caHash } }) => {
      switch (caHash) {
        case 'error':
          return {
            data: {
              caHolderManagerInfo: undefined,
            },
            error: 'getCAHolderManagerInfo_error',
          };
        case 'undefined':
          return {
            data: {
              caHolderManagerInfo: undefined,
            },
            error: undefined,
          };
        case 'empty':
        default:
          return {
            data: {
              caHolderManagerInfo: [
                {
                  caAddress: 'caAddress_mock',
                  caHash,
                  chainId: 'AELF',
                  id: 'id_mock',
                  managerInfos: [
                    {
                      address: 'address_mock',
                      extraData: 'extraData_mock',
                    },
                  ],
                  originChainId: 'AELF',
                },
              ],
            },
            error: undefined,
          };
      }
    },
    getLoginGuardianAccount: (_, { dto: { caHash } }) => {
      switch (caHash) {
        case 'login_error':
          return {
            data: {
              loginGuardianInfo: undefined,
            },
            error: 'getLoginGuardianAccount_error',
          };
        case 'empty':
          return {
            data: {
              loginGuardianInfo: undefined,
            },
            error: undefined,
          };
        default:
          return {
            data: {
              loginGuardianInfo: [
                {
                  caAddress: 'caAddress_mock',
                  caHash: 'caHash_mock',
                  chainId: 'AELF',
                  id: 'id_mock',
                  loginGuardian: {
                    identifierHash: 'identifierHash_mock',
                    isLoginGuardian: true,
                    salt: 'salt_mock',
                    type: 1,
                    verifierId: 'verifierId_mock',
                  },
                  manager: 'manager_mock',
                },
              ],
            },
            error: undefined,
          };
      }
    },
  };
});

import { DIDGraphQL } from '../src/did/index';

const client = getGraphQLClientProvider('');
const config = {
  graphQLClient: undefined as any,
};
const didGraphQL = new DIDGraphQL({ client, config });

describe('did describe', () => {
  test('test getHolderInfoByManager', async () => {
    config.graphQLClient = client;

    const result = await didGraphQL.getHolderInfoByManager({
      caHash: 'caHash_mock',
      manager: 'manager_mock',
      chainId: 'AELF',
    });
    expect(result).toHaveProperty('caHolderManagerInfo');

    config.graphQLClient = undefined;
    const result2 = await didGraphQL.getHolderInfoByManager({
      caHash: 'caHash_mock',
      manager: 'manager_mock',
      chainId: 'AELF',
    });
    expect(result2).toHaveProperty('caHolderManagerInfo');

    const result3 = await didGraphQL.getHolderInfoByManager({
      caHash: 'empty',
      manager: 'manager_mock',
      chainId: 'AELF',
    });
    expect(result3).toHaveProperty('caHolderManagerInfo');
    expect(result3.caHolderManagerInfo[0]?.loginGuardianInfo).toHaveLength(0);

    try {
      await didGraphQL.getHolderInfoByManager({
        caHash: 'error',
        manager: 'manager_mock',
        chainId: 'AELF',
      });
    } catch (error) {
      expect(error).toEqual('getCAHolderManagerInfo_error');
    }

    try {
      await didGraphQL.getHolderInfoByManager({
        caHash: 'login_error',
        manager: 'manager_mock',
        chainId: 'AELF',
      });
    } catch (error) {
      expect(error).toEqual('getLoginGuardianAccount_error');
    }
  });

  test('test getHolderInfoByManager no config', async () => {
    const didGraphQL = new DIDGraphQL({ client });
    const result = await didGraphQL.getHolderInfoByManager({
      caHash: 'caHash_mock',
      manager: 'manager_mock',
      chainId: 'AELF',
    });
    expect(result).toHaveProperty('caHolderManagerInfo');
  });

  test('test getHolderInfoByManager caHolderManagerInfo undefined', async () => {
    const result = await didGraphQL.getHolderInfoByManager({
      caHash: 'undefined',
      manager: 'manager_mock',
      chainId: 'AELF',
    });
    expect(result.caHolderManagerInfo).toHaveLength(0);
  });
});
