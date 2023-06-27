import 'isomorphic-fetch';
import { describe, expect, test } from '@jest/globals';
import { DIDConfig, RequestDefaultsConfig } from '../src/config';
import { StorageMock } from './__mocks__/storageMock';

const config = new DIDConfig();

describe('config describe', () => {
  const configOptions = {
    requestDefaults: {
      baseURL: 'https://did-portkey-test.portkey.finance',
    },
    connectUrl: 'https://auth-portkey-test.portkey.finance',
    graphQLUrl: 'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
    storageMethod: new StorageMock('mock1'),
  };
  config.setConfig(configOptions);

  test('test store', async () => {
    await config.storageMethod.setItem('testSave', '100');
    const value = await config.storageMethod.getItem('testSave');
    expect(value).toBe('100');
    await config.storageMethod.removeItem('testSave');
  });

  test('test change store', async () => {
    const myStore = new StorageMock('mock2');
    config.setConfig({
      storageMethod: myStore,
    });
    expect(config.storageMethod.storage).toHaveProperty('name', 'mock2');
  });

  test('test connectUrl', () => {
    expect(config.connectRequestConfig.baseURL).toEqual(configOptions.connectUrl);
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

  test('test RequestDefaultsConfig', () => {
    const requestDefaultsConfig = new RequestDefaultsConfig({
      url: 'url_mock',
    });
    expect(requestDefaultsConfig.url).toBe('url_mock');
  });

  test('test no storage', async () => {
    const noStorageConfig = new DIDConfig();
    try {
      await noStorageConfig.storageMethod.setItem('key_mock', '100');
    } catch (error) {
      expect(error).toBeTruthy();
    }
    try {
      await noStorageConfig.storageMethod.getItem('key_mock');
    } catch (error) {
      expect(error).toBeTruthy();
    }
    try {
      await noStorageConfig.storageMethod.removeItem('key_mock');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('test setConfig no value', () => {
    const config = new DIDConfig({
      requestDefaults: undefined,
    });
    expect(config.requestDefaults).toBeUndefined();
  });
});
