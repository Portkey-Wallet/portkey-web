import 'isomorphic-fetch';
import { describe, expect, test } from '@jest/globals';
import { DIDConfig } from '../src/config';
import { StorageMock } from './__mocks__/storageMock';

const config = new DIDConfig();

describe('config describe', () => {
  const configOptions = {
    requestDefaults: {
      baseURL: 'https://did-portkey-test.portkey.finance',
    },
    graphQLUrl: 'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
    storageMethod: new StorageMock('mock1'),
  };
  config.setConfig(configOptions);

  test('test store', async () => {
    await config.storageMethod.setItem('testSave', '100');
    const value = await config.storageMethod.getItem('testSave');
    expect(value).toBe('100');
  });

  test('test change store', async () => {
    const myStore = new StorageMock('mock2');
    config.setConfig({
      storageMethod: myStore,
    });
    expect(config.storageMethod.storage).toHaveProperty('name', 'mock2');
  });

  test('test graphQLUrl', () => {
    expect(config.graphQLUrl).toEqual(configOptions.graphQLUrl);
  });

  test('test requestDefaults', () => {
    expect(config.requestConfig.baseURL).toEqual(configOptions.requestDefaults?.baseURL);
  });

  test('test setConfig', () => {
    config.setConfig({
      requestDefaults: {
        baseURL: 'baseURL',
      },
    });
    expect(config.requestConfig.baseURL).toBe('baseURL');
  });
});
